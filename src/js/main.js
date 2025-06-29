// Arquivo: src/js/main.js (Versão Final Corrigida)

import '../css/style.css';
import { ref, onValue, query, orderByChild } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

/**
 * Busca todos os dados da raiz do banco de dados uma única vez.
 * @returns {Promise<object|null>}
 */
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

/**
 * Preenche o carrossel de times na página.
 * @param {object} teamsData - O objeto contendo os dados de todos os times.
 */
function loadTeamsCarousel(teamsData) {
    const carouselContainer = document.getElementById('team-carousel');
    if (!teamsData || !carouselContainer) return;

    const teamIds = Object.keys(teamsData);
    const allTeamIds = [...teamIds, ...teamIds];
    
    let html = '';
    allTeamIds.forEach(teamId => {
        const team = teamsData[teamId];
        const logoSrc = logoMap[teamId];

        if (team && logoSrc) {
            html += `
                <a href="/time.html?id=${teamId}" class="flex-shrink-0 mx-4 group w-24 text-center">
                    <img src="${logoSrc}" alt="Logo do ${team.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 group-hover:border-primary-orange transition-all duration-300 mx-auto">
                    <span class="mt-2 block text-xs sm:text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 truncate">${team.nome}</span>
                </a>
            `;
        }
    });

    carouselContainer.innerHTML = html;
    carouselContainer.classList.add('animate-marquee');
}

/**
 * Preenche a seção de próximas partidas.
 * @param {object} matchesData - Os dados das partidas.
 * @param {object} teamsData - Os dados dos times para consulta.
 */
function loadUpcomingMatches(matchesData, teamsData) {
    const container = document.getElementById('matches-container');
    const title = document.getElementById('matches-title');
    if (!container || !title) return;

    if (!matchesData || !teamsData) {
        title.textContent = 'Nenhuma partida agendada';
        container.innerHTML = '';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingMatches = Object.values(matchesData)
        .filter(match => new Date(match.data) >= today && match.status === 'Agendado')
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    if (upcomingMatches.length > 0) {
        const firstMatchDate = new Date(upcomingMatches[0].data);
        const dateOptions = { day: '2-digit', month: 'long' };
        title.textContent = `Partidas - ${firstMatchDate.toLocaleDateString('pt-BR', dateOptions)}`;
        
        container.innerHTML = '';
        upcomingMatches.forEach(match => {
            const teamA = teamsData[match.timeA];
            const teamB = teamsData[match.timeB];
            const logoSrcA = logoMap[match.timeA];
            const logoSrcB = logoMap[match.timeB];

            if (teamA && teamB && logoSrcA && logoSrcB) {
                container.innerHTML += `
                    <div class="bg-neutral-800 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out border border-neutral-700">
                        <div class="p-3 bg-neutral-900 flex justify-between items-center text-sm font-medium text-gray-400 border-b border-neutral-700">
                            <span>${new Date(match.data).toLocaleDateString('pt-BR', {weekday: 'long'})}</span>
                            <span class="font-bold text-white uppercase">${new Date(match.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div class="flex items-center justify-around p-6">
                            <a href="/time.html?id=${match.timeA}" class="flex flex-col items-center text-center w-28">
                                <img src="${logoSrcA}" alt="${teamA.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 mb-2">
                                <span class="text-lg font-bold text-white truncate w-full">${teamA.nome}</span>
                            </a>
                            <div class="flex items-center justify-center text-4xl md:text-5xl font-extrabold">
                                <span class="mx-3 text-gray-500">VS</span>
                            </div>
                            <a href="/time.html?id=${match.timeB}" class="flex flex-col items-center text-center w-28">
                                <img src="${logoSrcB}" alt="${teamB.nome}" class="w-20 h-20 rounded-full object-cover border-2 border-neutral-700 mb-2">
                                <span class="text-lg font-bold text-white truncate w-full">${teamB.nome}</span>
                            </a>
                        </div>
                    </div>
                `;
            }
        });
    } else {
        title.textContent = 'Nenhuma partida agendada';
        container.innerHTML = '<p class="col-span-full text-center text-gray-400">Volte mais tarde para conferir os próximos jogos.</p>';
    }
}


/**
 * Preenche a lista de artilheiros.
 * @param {object} artilhariaData - Os dados da artilharia.
 */
function loadTopScorers(artilhariaData) {
    const listContainer = document.getElementById('artilharia-list');
    if(!listContainer || !artilhariaData) return;
    
    listContainer.innerHTML = '';
    const sortedScorers = Object.values(artilhariaData).sort((a, b) => b.gols - a.gols);

    sortedScorers.forEach((scorer, index) => {
        listContainer.innerHTML += `
            <li class="flex justify-between items-center bg-neutral-900 rounded-lg p-4">
                <div class="flex items-center">
                    <span class="text-2xl font-bold text-gray-400 mr-4">${index + 1}º</span>
                    <div>
                        <span class="block text-xl font-semibold text-white">${scorer.nome}</span>
                        <span class="block text-sm text-gray-400">${scorer.time}</span>
                    </div>
                </div>
                <span class="text-3xl font-extrabold text-primary-orange">${scorer.gols} <span class="text-xl text-gray-500">Gols</span></span>
            </li>
        `;
    });
}

/**
 * Preenche as tabelas de classificação dos grupos.
 * @param {object} teamsData - Os dados de todos os times.
 */
function loadStandings(teamsData) {
    const tableBodyA = document.getElementById('standings-body-a');
    const tableBodyB = document.getElementById('standings-body-b');
    if (!tableBodyA || !tableBodyB || !teamsData) return;

    // Definição CORRIGIDA dos times em cada grupo
    const grupoA_ids = ['imp', 'amb', 'tnk', 'fdq', 'hip', 'ver', 'kwr', 'psg']; // Sai G29, entra PSG
    const grupoB_ids = ['cfc', 'hor', 'asa', 'naj', 'vmt', 'rep', 'maf', 'futpro'];
    
    const allTeams = Object.keys(teamsData).map(id => ({ id, ...teamsData[id] }));

    // Filtra e ordena os times para cada grupo
    const teamsGrupoA = allTeams.filter(team => grupoA_ids.includes(team.id)).sort(sortTeams);
    const teamsGrupoB = allTeams.filter(team => grupoB_ids.includes(team.id)).sort(sortTeams);

    // Popula as tabelas
    populateGroupTable(tableBodyA, teamsGrupoA);
    populateGroupTable(tableBodyB, teamsGrupoB);
}

// Função auxiliar para ordenar os times
function sortTeams(a, b) {
    if ((b.pontos || 0) !== (a.pontos || 0)) return (b.pontos || 0) - (a.pontos || 0);
    const saldoGolsA = (a.golsPro || 0) - (a.golsContra || 0);
    const saldoGolsB = (b.golsPro || 0) - (a.golsContra || 0);
    if (saldoGolsB !== saldoGolsA) return saldoGolsB - saldoGolsA;
    return (b.golsPro || 0) - (a.golsPro || 0);
}

// Função auxiliar para popular uma tabela de grupo
function populateGroupTable(tableBody, groupTeams) {
    tableBody.innerHTML = '';
    if (groupTeams.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-gray-400">Nenhum time neste grupo.</td></tr>';
        return;
    }

    groupTeams.forEach((team, index) => {
        const saldoGols = (team.golsPro || 0) - (team.golsContra || 0);
        const logoSrc = logoMap[team.id];
        if (!logoSrc) return;

        tableBody.innerHTML += `
            <tr class="border-b border-neutral-800 hover:bg-neutral-700/50">
                <td class="p-4 font-semibold">${index + 1}</td>
                <td class="p-4">
                    <a href="/time.html?id=${team.id}" class="flex items-center gap-3">
                        <img src="${logoSrc}" alt="${team.nome}" class="w-8 h-8 rounded-full object-cover">
                        <span class="font-semibold">${team.nome}</span>
                    </a>
                </td>
                <td class="p-4 text-center font-bold">${team.pontos || 0}</td>
                <td class="p-4 text-center">${team.jogos || 0}</td>
                <td class="p-4 text-center">${team.vitorias || 0}</td>
                <td class="p-4 text-center">${team.empates || 0}</td>
                <td class="p-4 text-center">${team.derrotas || 0}</td>
                <td class="p-4 text-center font-semibold">${saldoGols > 0 ? '+' : ''}${saldoGols}</td>
            </tr>
        `;
    });
}

// --- Ponto de Entrada da Aplicação ---
document.addEventListener('DOMContentLoaded', async () => {
    const allData = await getAllData();
    if (allData) {
        // Passa para cada função a parte do 'bancão' de dados que ela precisa
        loadTeamsCarousel(allData.times);
        loadUpcomingMatches(allData.partidas, allData.times);
        loadTopScorers(allData.artilharia);
        loadStandings(allData.times);
    }
});