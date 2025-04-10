import "./styles.css";
import { DataHandler } from "./datahandler";
import { UIBuilder } from "./ui/ui-builder";

const projects = DataHandler.loadData();

if(projects !== null) 
    UIBuilder.loadProjects(projects);
else
    UIBuilder.createDefault();

UIBuilder.buildAllProjectsView();