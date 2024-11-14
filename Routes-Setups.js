//IMPORTS
import express from 'express';
import cors from 'cors';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';

//CONSTS
const defaultData = { Livors: [{id: 1, Titulo: "Lusiadas", Ano_Lancamento: 1572, Edicao: "1", Linguagem: "PT" }] }
const db = await JSONFilePreset('Livros.json', defaultData);

const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

//ROUTES
app.get('/about', (req, res) => {
    const aboutPagePath = path.resolve('public', 'about.html');
    if (aboutPagePath){
        res.status(200).sendFile(aboutPagePath);

    }else {
        res.status(400).send('Not found');
    }
});
app.get('/doc', (req, res) => {
    const docPagePath = path.resolve('public', 'doc.html');
    if (docPagePath){
        res.status(200).sendFile(docPagePath);

    }else {
        res.status(400).send('Not found');
    }
});


app.get('/Livros', async (req, res) => {
    await db.read();
    const Livors = db.data.Livors;
    if (Livors){
        res.status(200).json(Livors);
    }else {
        res.status(404).send('Livros nor found');
    }
});

app.get('/Livros/:id', async (req, res) => {
    await db.read();
    const Livro = db.data.Livors.find((livro) => livro.id === (req.params.id).toString());
    if (Livro) {
        res.status(200).json(Livro);
    } else {
        res.status(404).send('Livro not found');
    }
});

app.post('/Livros/Create', async (req, res) => {
    const { Titulo, Ano_Lancamento, Edicao, Linguagem } = req.body;
    function getNextId() {
        if (db.data.Livors.length === 0) return 1; // Start at 1 if the list is empty

        const ids = db.data.Livors.map(item => parseInt(item.id)).sort((a, b) => a - b);

        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== i + 1) {
                return i + 1;
            }
        }

        return ids[ids.length - 1] + 1;
    }

    let id = getNextId().toString();

    const newLivro = {
        id: id,
        Titulo,
        Ano_Lancamento,
        Edicao,
        Linguagem
    };

    db.data.Livors.push(newLivro);
    await db.write();

    res.status(201).json({ message: 'Livro created successfully', livro: newLivro });
});


app.put('/Livros/Update/:id', async (req, res) => {
    const { Titulo, Ano_Lancamento, Edicao, Linguagem } = req.body;
    const newLivro = {

        Titulo,
        Ano_Lancamento,
        Edicao,
        Linguagem
    };
    await db.read();
    const user = db.data.Livors.find((user) => user.id === (req.params.id).toString());
    if (user) {
        Object.assign(user, newLivro);
        await db.write();
        console.log(`user with id ${req.params.id} updated.`);
        res.status(200);
    } else {
        res.status(404);
        console.log(`user with id ${req.params.id} not found.`);
    }
});


app.delete('/Livros/Delete/:id', async (req, res) => {
    await db.read();
    const livroIndex = db.data.Livors.findIndex((livro) => livro.id === req.params.id);

    if (livroIndex !== -1) {
        const [livroRemoved] = db.data.Livors.splice(livroIndex, 1);
        await db.write();
        res.status(200).json({ message: 'Livro removed successfully', livro: livroRemoved });
    } else {
        res.status(404).send('Livro not found');
    }
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
