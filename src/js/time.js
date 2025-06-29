import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

function renderStats(statsContainer, teamData) {
    if (!statsContainer || !teamData) return;
    const stats = [
        { label: 'Pontos', value: teamData.pontos || 0 },
        { label: 'Jogos', value: teamData.jogos || 0 },
        { label: 'Vitórias', value: teamData.vitorias || 0 },
        { label: 'Empates', value: teamData.empates || 0 },
        { label: 'Derrotas', value: teamData.derrotas || 0 },
        { label: 'Gols Pró', value: teamData.golsPro || 0 },
    ];
    statsContainer.innerHTML = stats.map(stat => `
        <div class="bg-neutral-900 p-4 rounded-lg">
            <p class="text-3xl font-bold text-primary-orange">${stat.value}</p>
            <p class="text-sm text-gray-400">${stat.label}</p>
        </div>
    `).join('');
}

function renderPlayers(gridElement, playersData) {
    if (!gridElement) return;
    gridElement.innerHTML = '';
    if (playersData && Object.keys(playersData).length > 0) {
        const playersArray = Object.values(playersData);
        playersArray.forEach(player => {
            const playerPhoto = player.fotoUrl || '/img/placeholder-player.png';
            const playerName = player.nome || 'Nome não informado';
            const playerPosition = player.posicao || 'Posição não informada';
            gridElement.innerHTML += `
                <div class="flex flex-col items-center text-center group cursor-pointer">
                    <div class="relative">
                        <img src="${playerPhoto}" alt="Foto de ${playerName}" class="w-28 h-28 rounded-full object-cover border-4 border-neutral-700 group-hover:border-primary-orange transition-all duration-300 transform group-hover:scale-110">
                        ${player.numero ? `<div class="absolute bottom-0 right-0 bg-primary-orange text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-neutral-800">${player.numero}</div>` : ''}
                    </div>
                    <h3 class="mt-4 text-lg font-semibold text-white truncate w-full">${playerName}</h3>
                    <p class="text-sm text-primary-orange/80">${playerPosition}</p>
                </div>
            `;
        });
    } else {
        gridElement.innerHTML = '<p class="col-span-full text-center text-gray-400">Elenco ainda não cadastrado.</p>';
    }
}

function renderCoaches(sectionElement, gridElement, coachesData) {
    if (!gridElement || !sectionElement) return;
    if (coachesData && Object.keys(coachesData).length > 0) {
        sectionElement.classList.remove('hidden');
        gridElement.innerHTML = '';
        const coachesArray = Object.values(coachesData);
        coachesArray.forEach(coach => {
            const coachPhoto = coach.fotoUrl || '/img/placeholder-player.png';
            const coachName = coach.nome || 'Nome não informado';
            const coachRole = coach.cargo || 'Cargo não informado';
            gridElement.innerHTML += `
                <div class="flex flex-col items-center text-center group">
                    <img src="${coachPhoto}" alt="Foto de ${coachName}" class="w-28 h-28 rounded-full object-cover border-4 border-neutral-700">
                    <h3 class="mt-4 text-lg font-semibold text-white">${coachName}</h3>
                    <p class="text-sm text-primary-orange/80">${coachRole}</p>
                </div>
            `;
        });
    } else {
        sectionElement.classList.add('hidden');
    }
}

// Função para renderizar os ícones sociais
function renderSocials(container, teamData) {
    if (!container || !teamData) return;
    container.innerHTML = '';
    if (teamData.instagramUrl && teamData.instagramUrl !== "#") {
        container.innerHTML = `
            <a href="${teamData.instagramUrl}" target="_blank" rel="noopener noreferrer" class="text-neutral-400 hover:text-primary-orange transition-colors">
                <i class="ph-bold ph-instagram-logo text-3xl"></i>
            </a>
        `;
    }
}

function loadTeamData() {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('id');
    const teamHeaderEl = document.getElementById('team-header');
    const teamNameEl = document.getElementById('team-name');
    const playerGridEl = document.getElementById('player-grid');
    const statsContainerEl = document.getElementById('team-stats');
    const coachSectionEl = document.getElementById('coaching-staff-section');
    const coachGridEl = document.getElementById('coach-grid');
    const socialsContainerEl = document.getElementById('team-socials');

    const handleNoData = (message) => {
        if(teamNameEl) teamNameEl.textContent = message;
        if(teamHeaderEl) teamHeaderEl.classList.remove('opacity-0');
        if(playerGridEl) playerGridEl.innerHTML = `<p class="col-span-full text-center text-gray-400">Não foi possível carregar os dados do time.</p>`;
    };
    
    if (!teamId) {
        handleNoData('Time não encontrado!');
        return;
    }

    const teamRef = ref(database, `times/${teamId}`);

    onValue(teamRef, (snapshot) => {
        if (!snapshot.exists()) {
            handleNoData('Dados do time não encontrados!');
            return;
        }

        const teamData = snapshot.val();
        
        document.title = `${teamData.nome || 'Time'} | Royal Cup`;
        teamNameEl.textContent = teamData.nome || 'Nome do Time';
        document.getElementById('team-description').textContent = teamData.descricao || 'Conheça mais sobre a trajetória e os atletas deste time.';
        document.getElementById('team-logo').src = logoMap[teamId] || '/img/default-logo.png';
        
        teamHeaderEl.classList.remove('opacity-0');
        
        renderStats(statsContainerEl, teamData);
        renderPlayers(playerGridEl, teamData.jogadores);
        renderCoaches(coachSectionEl, coachGridEl, teamData.comissaoTecnica);
        renderSocials(socialsContainerEl, teamData);

    }, { onlyOnce: true });
}

document.addEventListener('DOMContentLoaded', loadTeamData);