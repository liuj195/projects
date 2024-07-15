import K1Constants from "./K1Constants";
import TstConstants from "./TstConstants";
import graphProcessor from "./graphProcessor";
import yk1Controller from "./yk1Controller";
import textUtilities from "../utilityJS/text_utilities";
import arrayUtils from "../utilityJS/array_utilities";
import yk1WebServices from "./yk1WebServices";
//import yk1WebServices from "./yk1WebServices_offline";
import graphNodeEdge from "../graph/graphNodeEdge";
import graphUtility from "../graph/graphUtility";
import graphMain from "../graph/graphMain";
import graphLayout from "../graph/graphLayout";
import graphInput from "../graph/graphInput";
import dataValidation from "./dataValidation";
import { polyfill } from "es6-promise";
polyfill();

let YK1 = {};

YK1 = graphInput(YK1);
YK1 = graphNodeEdge(YK1);
YK1 = graphUtility(YK1);
YK1 = graphMain(YK1);
YK1 = graphLayout(YK1);
YK1 = K1Constants(YK1);
YK1 = TstConstants(YK1);
YK1 = graphProcessor(YK1);
YK1 = yk1WebServices(YK1);
YK1 = yk1Controller(YK1);
YK1 = textUtilities(YK1);
YK1 = arrayUtils(YK1);
YK1 = dataValidation(YK1);
YK1.noDataFailArray = [];
YK1.numYears = 0;
YK1.yearsIteration = 0;

export default YK1;
