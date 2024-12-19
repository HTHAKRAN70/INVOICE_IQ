const express = require('express');
const app = express();
const cors = require('cors');
const { PORT } = require('./config/index');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const invoiceRouter = require('./routes/invoice');
const { dbconnect } = require('./config/db');
const branchRouter = require('./routes/branch');
const categoryRouter = require('./routes/category');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/v1', userRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', invoiceRouter);
app.use('/api/v1', branchRouter);
app.use('/api/v1', categoryRouter);


app.listen(PORT, () => {
    dbconnect();
    console.log(`Server running on port ${PORT}`);
});