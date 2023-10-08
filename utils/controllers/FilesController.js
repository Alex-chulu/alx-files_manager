import { tmpdir } from 'os';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import { v4 as uuidv4 } from 'uuid';
import {
  mkdir, writeFile, stat, existsSync, realpath,
} from 'fs';
import { join as joinPath } from 'path';
import { Request, Response } from 'express';
import { contentType } from 'mime-types';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from '../utils/db';
import { getUserFromXToken } from '../utils/auth';

// Import required modules and database utilities
const { File } = require('../models'); // Replace with your actual database model
const { verifyToken } = require('../utils/auth'); // Import a function to verify tokens

// Controller functions for retrieving files
const FilesController = {
  // GET /files/:id - Retrieve a specific file document by ID
  getShow: async (req, res) => {
    try {
      // Get the file ID from the route parameters
      const { id } = req.params;

      // Retrieve the user based on the token
      const user = await verifyToken(req.headers.authorization);

      // If the user is not found, return an unauthorized error
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the file document based on the user and the ID
      const file = await File.findOne({ _id: id, parentId: user._id });

      // If no file document is found, return a not found error
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Return the file document
      res.status(200).json(file);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // GET /files - Retrieve file documents with pagination
  getIndex: async (req, res) => {
    try {
      // Retrieve the user based on the token
      const user = await verifyToken(req.headers.authorization);

      // If the user is not found, return an unauthorized error
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Define pagination options (page size and starting point)
      const page = parseInt(req.query.page) || 0;
      const pageSize = 20;
      const skip = page * pageSize;

      // Query for file documents based on parentId and skip for pagination
      const files = await File.find({ parentId: user._id })
        .skip(skip)
        .limit(pageSize);

      // Return the list of file documents
      res.status(200).json(files);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = FilesController;

