import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

/**
 * Busca os dados dos times no Firebase.
 * @returns {Promise<object|null>}
 */
async function getTeamsData() {
    const teamsRef = ref(database, 'times');
    return new Promise((resolve) => {
        onValue(teamsRef, (snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val());
            } else {
                console.error("Nenhum time encontrado no Firebase.");
                resolve(null);
            }
        }, { onlyOnce: true });
    });
}

/**
 * Renderiza os cards dos times na grade.
 * @param {object} teamsData - O objeto contendo os dados de todos os times.
 */
function renderTeamsGrid(teamsData) {
    const gridContainer = document.getElementById('teams-grid');
    if (!gridContainer || !teamsData) return;

    gridContainer.innerHTML = ''; // Limpa o container

    for (const teamId in teamsData) {
        const team = teamsData[teamId];
        const logoSrc = logoMap[teamId] || '/img/default-logo.png';

        // Estrutura do Card Refinada
        const cardHtml = `
            <a href="/time.html?id=${teamId}" class="relative aspect-video block bg-neutral-800 rounded-xl overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 shadow-lg hover:shadow-primary-orange/20 border border-neutral-700">
                <img src="${logoSrc}" alt="Logo ${team.nome}" class="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110" />
                <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-center">
                    <h3 class="text-lg font-bold text-white group-hover:text-primary-orange transition-colors duration-300">${team.nome}</h3>
                </div>
            </a>
        `;
        gridContainer.innerHTML += cardHtml;
    }
}

// Ponto de Entrada da Página
document.addEventListener('DOMContentLoaded', async () => {
    const teamsData = await getTeamsData();
    if (teamsData) {
        renderTeamsGrid(teamsData);
    }
});