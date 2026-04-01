import express from 'express';
import dotevn from 'dotenv';
import cookieParser from 'cookie-parser';
import orderRoutes from './routes/orderRoutes.js';

dotevn.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


// app.use('/', (req, res) => {
//     res.send("order microservice is running");
// });

app.use('/hello', orderRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});