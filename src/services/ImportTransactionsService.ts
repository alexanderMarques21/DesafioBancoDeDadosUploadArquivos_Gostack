import path from 'path';

import fs from 'fs';

import { getRepository, getCustomRepository, In } from 'typeorm';
import upload from '../config/upload';
import loadCSV from '../util/csvReader';

import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(csvFilename: string): Promise<Transaction[]> {
    const csvPath = path.join(upload.directory, csvFilename);

    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);
    const transactionsStringArray = await loadCSV(csvPath);

    const transactions: any[] = [];
    let categories: string[] = [];

    transactionsStringArray.forEach(transactionSubArray => {
      const [title, type, value, category] = transactionSubArray;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    const categoriesSet = new Set(categories);
    categories = Array.from(categoriesSet);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const notExistentCategoriesTitle = categories.map(category => {
      if (!existentCategoriesTitle.includes(category)) {
        return category;
      }
      return undefined;
    });

    const categoriesToBeSaved = notExistentCategoriesTitle.filter(
      category => category,
    );

    const newCategories = categoriesRepository.create(
      categoriesToBeSaved.map(title => ({
        title,
      })),
    );
    await categoriesRepository.save(newCategories);

    const allCategories = [...existentCategories, ...newCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(csvPath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
