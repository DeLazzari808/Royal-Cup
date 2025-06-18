// Arquivo: src/js/time.js (Versão Sênior)

import '../css/style.css';
import { ref, onValue } from "firebase/database";
import { database } from './firebase-config.js';
import { logoMap } from './team-logos.js';

/**
 * Renderiza uma lista de membros (jogadores ou comissão) em um container.
 * Uma função reutilizável que segue o princípio DRY.
 * @param {HTMLElement} container - O elemento DOM onde os cards serão inseridos.
 * @param {object} members - O objeto de membros vindo do Firebase.
 * @param {string} placeholderImg - Caminho para a imagem placeholder.
 * @param {string} emptyStateMessage - Mensagem para exibir se não houver membros.
 */
function renderMembers(container, members, placeholderImg, emptyStateMessage) {
    if (!container) return;

    container.innerHTML = '';
    if (members && Object.keys(members).length > 0) {
        Object.values(members).forEach(member => {
            const photoUrl = member.fotoUrl || placeholderImg;
            const primaryText = member.nome || 'Nome não informado';
            const secondaryText = member.posicao || member.cargo || '';

            container.innerHTML += `
                <div class="text-center transition-transform transform hover:scale-105 group">
                    <img src="${photoUrl}" alt="Foto de ${primaryText}" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-2 border-neutral-700 group-hover:border-primary-orange transition-colors duration-300">
                    <h3 class="text-lg font-semibold text-white">${primaryText}</h3>
                    <p class="text-sm text-gray-400">${secondaryText}</p>
                </div>
            `;
        });
    } else {
        container.innerHTML = `<p class="col-span-full text-center text-gray-400">${emptyStateMessage}</p>`;
    }
}

/**
 * Ponto de entrada para carregar e exibir todos os dados da página do time.
 */
function loadTeamPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('id');
    const teamNameEl = document.getElementById('team-name');

    if (!teamId) {
        if (teamNameEl) teamNameEl.textContent = 'Time não encontrado!';
        console.error('ID do time não fornecido na URL.');
        return;
    }

    const teamRef = ref(database, `times/${teamId}`);

    onValue(teamRef, (snapshot) => {
        if (!snapshot.exists()) {
            if(teamNameEl) teamNameEl.textContent = 'Dados do time não encontrados!';
            console.error(`Dados para o time ${teamId} não encontrados.`);
            return;
        }

        const teamData = snapshot.val();
        
        document.title = `${teamData.nome} | Royal Cup`;
        teamNameEl.textContent = teamData.nome;
        document.getElementById('team-description').textContent = teamData.descricao || 'Descrição não disponível.';
        const teamLogoEl = document.getElementById('team-logo');
        if (teamLogoEl && logoMap[teamId]) {
            teamLogoEl.src = logoMap[teamId];
            teamLogoEl.alt = `Logo do ${teamData.nome}`;
            teamLogoEl.classList.remove('opacity-0');
        }

        renderMembers(
            document.getElementById('player-grid'), 
            teamData.jogadores, 
            '/img/placeholder-player.png', 
            'Elenco não cadastrado.'
        );
        
        renderMembers(
            document.getElementById('staff-grid'), 
            teamData.comissaoTecnica, 
            '/img/placeholder-staff.png', 
            'Comissão técnica não cadastrada.'
        );
    });
}

// O evento 'DOMContentLoaded' garante que o script só rode após o HTML estar pronto.
document.addEventListener('DOMContentLoaded', loadTeamPage);