import '../css/style.css';
import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

async function getAllData() {
    const dataRef = ref(database);
    return new Promise((resolve) => {
        onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val());
            } else {
                console.error("Nenhum dado encontrado no Firebase.");
                resolve(null);
            }
        }, { onlyOnce: true });
    });
}

function loadTeamsCarousel(teamsData) {
    const carouselContainer = document.getElementById('team-carousel');
    if (!teamsData || !carouselContainer) return;
    const teamIds = Object.keys(teamsData);
    const allTeamIds = [...teamIds, ...teamIds];
    carouselContainer.innerHTML = allTeamIds.map(teamId => {
        const team = teamsData[teamId];
        const logoSrc = logoMap[teamId];
        return team && logoSrc ? `
            <a href="/time.html?id=${teamId}" class="flex-shrink-0 mx-4 group w-24 text-center">
                <img src="${logoSrc}" alt="Logo do ${team.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 group-hover:border-primary-orange transition-all duration-300 mx-auto">
                <span class="mt-2 block text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 truncate">${team.nome}</span>
            </a>` : '';
    }).join('');
    carouselContainer.classList.add('animate-marquee');
}

function loadLastResults(matchesData, teamsData) {
    const container = document.getElementById('results-container');
    if (!container) return;

    if (!matchesData || !teamsData) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Resultados indisponíveis.</p>';
        return;
    }

    const finishedMatches = Object.values(matchesData)
        .filter(match => match.status === 'Finalizado')
        .sort((a, b) => new Date(b.data) - new Date(a.data));

    if (finishedMatches.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Nenhum resultado finalizado ainda.</p>';
        return;
    }

    container.innerHTML = finishedMatches.map(partida => {
        const teamA = teamsData[partida.timeA];
        const teamB = teamsData[partida.timeB];
        const logoSrcA = logoMap[partida.timeA];
        const logoSrcB = logoMap[partida.timeB];
        if (!teamA || !teamB || !logoSrcA || !logoSrcB) return '';
        const placarA = partida.placarA !== undefined ? partida.placarA : 0;
        const placarB = partida.placarB !== undefined ? partida.placarB : 0;

        return `
            <div class="bg-neutral-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out border border-neutral-700">
                <div class="p-3 bg-neutral-900 flex justify-between items-center text-sm font-medium text-gray-400 border-b border-neutral-700">
                    <span>${new Date(partida.data).toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'short'})}</span>
                    <span class="font-bold text-white uppercase">Finalizado</span>
                </div>
                <div class="flex items-center justify-around p-6">
                    <a href="/time.html?id=${partida.timeA}" class="flex flex-col items-center text-center w-28"><img src="${logoSrcA}" alt="${teamA.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 mb-2"><span class="text-lg font-bold text-white truncate w-full">${teamA.nome}</span></a>
                    <div class="flex items-center justify-center text-4xl md:text-5xl font-extrabold text-primary-orange"><span>${placarA}</span><span class="mx-3 text-gray-500">-</span><span>${placarB}</span></div>
                    <a href="/time.html?id=${partida.timeB}" class="flex flex-col items-center text-center w-28"><img src="${logoSrcB}" alt="${teamB.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 mb-2"><span class="text-lg font-bold text-white truncate w-full">${teamB.nome}</span></a>
                </div>
            </div>`;
    }).join('');
}


// ==================================================================
// == FUNÇÃO loadKnockoutStage CORRIGIDA PARA LER DADOS REAIS      ==
// ==================================================================
function loadKnockoutStage(matchesData, teamsData) {
    const container = document.getElementById('bracket-container');
    if (!container || !matchesData || !teamsData) return;

    // Mapeamento dos jogos do mata-mata para os IDs das partidas no Firebase
    const oitavasIds = ['partida01', 'partida02', 'partida03', 'partida04', 'partida05', 'partida06', 'partida07', 'partida08', 'partida09']; // Adicionei a partida09 que estava faltando
    
    // Você precisará adicionar os IDs das partidas das quartas, semis e final quando elas forem criadas no Firebase
    const quartasIds = ['partida11', 'partida12', 'partida13', 'partida14']; 
    const semiIds = ['partida15', 'partida16'];
    const finalId = 'partida17';

    // Pega os dados das partidas do Firebase usando os IDs
    const oitavas = oitavasIds.map(id => matchesData[id]).filter(Boolean); // .filter(Boolean) remove partidas nulas se o ID não existir
    const quartas = quartasIds.map(id => matchesData[id]).filter(Boolean);
    const semi = semiIds.map(id => matchesData[id]).filter(Boolean);
    const final = [matchesData[finalId]].filter(Boolean);

    const renderMatch = (match) => {
        if (!match) return '<div class="match-up"></div>'; // Retorna um placeholder se a partida não existir

        const teamA = teamsData[match.timeA];
        const teamB = teamsData[match.timeB];
        const logoA = teamA ? logoMap[match.timeA] : '/img/default-logo.png';
        const logoB = teamB ? logoMap[match.timeB] : '/img/default-logo.png';
        const nameA = teamA ? teamA.nome : 'A definir';
        const nameB = teamB ? teamB.nome : 'A definir';
        const scoreA = match.placarA !== undefined ? match.placarA : '';
        const scoreB = match.placarB !== undefined ? match.placarB : '';
        const winnerA = scoreA !== '' && scoreB !== '' && scoreA > scoreB;
        const winnerB = scoreA !== '' && scoreB !== '' && scoreB > scoreA;

        return `
            <div class="match-up">
                <div class="match bg-neutral-800 rounded-lg p-3 w-full min-w-[250px] shadow-lg">
                    <div class="flex justify-between items-center"><div class="flex items-center gap-2 ${winnerA ? 'font-bold text-white' : 'text-neutral-400'}"><img src="${logoA}" class="w-6 h-6 rounded-full object-cover ${winnerA ? 'border-2 border-primary-orange' : 'border-2 border-transparent'}"><span>${nameA}</span></div><span class="font-mono font-bold ${winnerA ? 'text-primary-orange' : 'text-neutral-400'}">${scoreA}</span></div>
                    <div class="flex justify-between items-center mt-2"><div class="flex items-center gap-2 ${winnerB ? 'font-bold text-white' : 'text-neutral-400'}"><img src="${logoB}" class="w-6 h-6 rounded-full object-cover ${winnerB ? 'border-2 border-primary-orange' : 'border-2 border-transparent'}"><span>${nameB}</span></div><span class="font-mono font-bold ${winnerB ? 'text-primary-orange' : 'text-neutral-400'}">${scoreB}</span></div>
                </div>
            </div>`;
    };
    
    // Completa as fases com placeholders se os jogos ainda não existirem
    while (quartas.length < 4) quartas.push(null);
    while (semi.length < 2) semi.push(null);
    while (final.length < 1) final.push(null);

    const campeao = { time: '' }; // Lógica do campeão pode ser adicionada depois
    const campeaoTeam = teamsData[campeao.time];
    const campeaoHTML = campeaoTeam ? `<div class="match-up"><div class="flex flex-col items-center gap-2"><i class="ph-fill ph-trophy text-5xl text-yellow-400"></i><img src="${logoMap[campeao.time]}" class="w-24 h-24 rounded-full border-4 border-yellow-400 object-cover"/><span class="font-bold text-xl">${campeaoTeam.nome}</span><span class="text-sm text-yellow-500 uppercase font-semibold">Campeão</span></div></div>` : '<div class="match-up"></div>';

    container.innerHTML = `
        <div class="round">${oitavas.map(renderMatch).join('')}</div>
        <div class="round">${quartas.map(renderMatch).join('')}</div>
        <div class="round">${semi.map(renderMatch).join('')}</div>
        <div class="round">${final.map(renderMatch).join('')}</div>
        <div class="round champion-column">${campeaoHTML}</div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const allData = await getAllData();
    if (allData) {
        loadTeamsCarousel(allData.times);
        loadLastResults(allData.partidas, allData.times);
        loadKnockoutStage(allData.partidas, allData.times); 
    }
    
    const btn = document.querySelector("button.mobile-menu-button");
    const menu = document.querySelector(".mobile-menu");
    if(btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });
    }
});