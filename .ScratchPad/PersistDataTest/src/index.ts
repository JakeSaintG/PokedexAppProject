import { Env } from './env';
import { runStartUp } from "./startup";

runStartUp(Env.DATA_SOURCE, Env.FORCE_UPDATE);
