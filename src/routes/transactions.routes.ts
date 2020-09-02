import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

// import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const categoryService = new CreateCategoryService();
  const transactionService = new CreateTransactionService();

  const categoryCreated = await categoryService.execute(category);

  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category: categoryCreated,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteService = new DeleteTransactionService();
  await deleteService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();

    const csvFilename = request.file.filename;
    const transactions = await importTransactionService.execute(csvFilename);
    response.json(transactions);
  },
);

export default transactionsRouter;
