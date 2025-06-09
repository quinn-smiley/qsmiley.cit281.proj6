const express = require('express');
const session = require('express-session');
const app = express();
const listenPort = 3000;
const listenIP = '127.0.0.1';

app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-dev-secret',
    resave: false,
    saveUninitialized: false
}));

const players = [];

app.post('/name', (req, res) => {

    function initializePlayer(name) {
        return { name };
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is a required field' });
    }

    const newPlayer = initializePlayer(name.trim());
    players.push(newPlayer);

    req.session.name = newPlayer.name;

    res.status(200).json({
        name: newPlayer.name,
    });

})

app.get('/welcome', (req, res) => {
    const { name } = req.session
    const response = {
        opening: `Welcome ${name}`,
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name was not found' });
    }
     return res.status(200).json({
        welcome: response,
    })
})

const questions = ['What is your favorite color?', 'What is your favorite type of music?', 'What is your favorite activity?'];
const colorAnswers = ['Pink', 'Blue', 'Black', 'Purple'];
const musicAnswers = ['Rock', 'Pop', 'Indie', 'R&B'];
const activityAnswers = ['Sports', 'Arts & Crafts', 'Making music', 'Shopping'];

app.get('/get-questions', (req, res) => {
     if (!colorAnswers || !musicAnswers || !activityAnswers || !questions){
        return res.status(400).json({ error: 'All questions must be answered' });
    } else {
        res.status(200).json({
            question1: questions[0],
            options1: colorAnswers,
            question2: questions[1],
            options2: musicAnswers,
            question3: questions[2],
            options3: activityAnswers,
        })
    }

})

app.post('/responses', (req, res) => {
    let { colorResponse, musicResponse, activityResponse } = req.body
    
    if (
        typeof colorResponse !== 'number' ||
        colorResponse < 1 ||
        colorResponse > colorAnswers.length
    ) {
        return res.status(400).json({ error: 'Invalid answer for question #1' });
    }

    if (
        typeof musicResponse !== 'number' ||
        musicResponse < 1 ||
        musicResponse > musicAnswers.length
    ) {
        return res.status(400).json({ error: 'Invalid answer for question #2' });
    }

    if (
        typeof activityResponse !== 'number' ||
        activityResponse < 1 ||
        activityResponse > activityAnswers.length
    ) {
        return res.status(400).json({ error: 'Invalid answer for question #3' });
    }

    if (!colorResponse || !musicResponse || !activityResponse) {
        return res.status(400).json({ error: 'All questions must be answered' });
    }

    const selectedColor = colorAnswers[colorResponse - 1];
    const selectedMusic = musicAnswers[musicResponse - 1];
    const selectedActivity = activityAnswers[activityResponse - 1];

    req.session.colorResponse = selectedColor;
    req.session.musicResponse =  selectedMusic;
    req.session.activityResponse =  selectedActivity;

    res.status(200).json({
            question1: questions[0],
            colorResponse: selectedColor,
            question2: questions[1],
            musicResponse: selectedMusic,
            question3: questions[2],
            activityResponse: selectedActivity,
    })
});


app.get('/get-result', (req, res) => {
    const { colorResponse, musicResponse, activityResponse, name } = req.session;

    if (!colorResponse || !musicResponse || !activityResponse) {
        return res.status(400).json({ error: 'All questions must be answered' });
    }

    const isMyMelody = (
        ((colorResponse === 'Pink' || colorResponse === 'Blue') &&
         (musicResponse === 'Pop' || musicResponse === 'Indie')) ||

        ((musicResponse === 'Pop' || musicResponse === 'Indie') &&
         (activityResponse === 'Arts & Crafts' || activityResponse === 'Shopping')) ||

        ((colorResponse === 'Pink' || colorResponse === 'Blue') &&
         (activityResponse === 'Arts & Crafts' || activityResponse === 'Shopping'))
    );

    if (isMyMelody){
        return res.status(200).send(`${name}, you are My Melody!`);
    } else {
        return res.status(200).send(`${name}, you are Kuromi!`);
    }
});

app.delete('/reset', (req, res) => {
    delete req.session.colorResponse;
    delete req.session.musicResponse;
    delete req.session.activityResponse;

    res.status(200).json({ message: 'Responses have been reset' });
});

app.put('/rename', (req, res) =>{
    const {name} = req.session
    const {newName} = req.body
    
    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
        return res.status(400).json({ error: 'New name is required and must be a non-empty string' });
    }

    if (!name) {
        return res.status(400).json({ error: 'No user session found. Please set your name first.' });
    }

    const trimmedName = newName.trim();
    req.session.name = trimmedName;

    const player = players.find(p => p.name === name);
    if (player) {
        player.name = trimmedName;
    }

    res.status(200).json({
        message: `Name changed from ${name} to ${trimmedName}`,
        name: trimmedName
    });
})


app.use((req, res) => {
    const response = {
    error: 'Route not found', 
    statusCode: 404
  };
  res.status(404).send(response);
});

app.listen(listenPort, listenIP, () => {
    console.log(`Server is running on http://${listenIP}:${listenPort}`);
});