$(document).ready(function () {
    var playerNames = {};
    var playerStats = {};

    async function fetchPlayerInfo() {
        const response = await $.getJSON('/player-info');
        playerNames = response;
    }

    async function fetchLiveGameweekData(gameweek) {
        const response = await $.getJSON(`/event-live/${gameweek}`);
        playerStats = response.elements.reduce((acc, curr) => {
            acc[curr.id] = curr.stats.total_points;  // Adjust according to actual response structure
            return acc;
        }, {});
    }
    function initializeForm() {
        const savedTeamId = localStorage.getItem('teamId');
        if (savedTeamId) {
            $('#teamId').val(savedTeamId);
        }
    }
    
    function saveTeamId(teamId) {
        localStorage.setItem('teamId', teamId);
    } 

    $('#fplForm').on('submit', async function (e) {
        e.preventDefault();
        const teamId = $('#teamId').val();
        const gameweek = $('#gameweek').val();
        
        saveTeamId(teamId);

        await fetchPlayerInfo();
        await fetchLiveGameweekData(gameweek);

        const url = `/fpl-team/${teamId}/gw/${gameweek}`;
        $.getJSON(url, function (data) {
            var mainSquadHtml = '<table><tr><th>Points</th><th>Player</th><th>Position</th></tr>';
            var benchHtml = '<table><tr><th>Points</th><th>Player</th><th>Position</th></tr>';
            var totalPoints = 0;
            data.picks.forEach(pick => {
                const playerName = playerNames[pick.element];
                const originalPoints = parseInt(playerStats[pick.element] || '0');
                const points = originalPoints * pick.multiplier;

                let role = '';
                if (pick.is_captain) {
                   role = ' (C)';
                } else if (pick.is_vice_captain) {
                    role = ' (VC)';
                }
                const fullPlayerName = playerName + role;

                if (pick.position <= 11) {  // Assuming the first 11 are main players
                    totalPoints += points;
                    mainSquadHtml += `<tr><td>${points}</td><td>${fullPlayerName}</td><td>${pick.position}</td></tr>`;
                } else {
                    benchHtml += `<tr><td>${points}</td><td>${fullPlayerName}</td><td>${pick.position}</td></tr>`;
                }
    
            });
            mainSquadHtml += `<tr><td><strong>${totalPoints}</strong></td></tr>`;
            mainSquadHtml += '</table>';
            benchHtml += '</table>';
            $('#fplResults').html(mainSquadHtml + '<br>' + benchHtml);
        }).fail(function () {
            $('#fplResults').text('Failed to retrieve data. Please check the team ID and gameweek, and ensure the API is available.');
        });
    });

    initializeForm();
});