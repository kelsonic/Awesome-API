// Node modules.
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Application } from "express";

const applyMiddlewares = (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(morgan("dev"));
};

export default applyMiddlewares;
