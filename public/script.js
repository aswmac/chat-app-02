document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    let claimers = { window1: null, window2: null };

    function updateText(window, text) {
        document.getElementById(`textWindow${window[6]}`).value = text;
    }

    function setClaimedState(window, isClaimed, userId) {
        const textarea = document.getElementById(`textWindow${window[6]}`);
        if (isClaimed) {
            textarea.style.backgroundColor = 'lightgreen';
            textarea.readOnly = false;
        } else {
            textarea.style.backgroundColor = '';
            textarea.readOnly = true;
        }
    }

    socket.on('chatHistory', ({ window1, window2 }) => {
        updateText({ target: { id: 'window1' } }, window1);
        updateText({ target: { id: 'window2' } }, window2);
    });

    socket.on('windowClaimed', ({ window, userId }) => {
        claimers[window] = userId;
        setClaimedState(window, true, userId);
    });

    socket.on('windowReleased', ({ window, userId }) => {
        claimers[window] = null;
        setClaimedState(window, false, userId);
    });

    socket.on('updateText', ({ window, text }) => {
        updateText({ target: { id: window } }, text);
    });

    document.getElementById('claimButton1').addEventListener('click', () => {
        socket.emit('claimWindow', { window: 'window1' });
    });

    document.getElementById('releaseButton1').addEventListener('click', () => {
        socket.emit('releaseWindow', { window: 'window1' });
    });

    document.getElementById('claimButton2').addEventListener('click', () => {
        socket.emit('claimWindow', { window: 'window2' });
    });

    document.getElementById('releaseButton2').addEventListener('click', () => {
        socket.emit('releaseWindow', { window: 'window2' });
    });

    document.getElementById('textWindow1').addEventListener('input', (event) => {
        socket.emit('typing', { window: 'window1', text: event.target.value });
    });

    document.getElementById('textWindow2').addEventListener('input', (event) => {
        socket.emit('typing', { window: 'window2', text: event.target.value });
    });
});
