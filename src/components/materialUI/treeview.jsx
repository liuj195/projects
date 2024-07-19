import React, { useState, useEffect } from "react";
//import { makeStyles } from "@material-ui/core/styles";
//import TreeView from "@material-ui/lab/TreeView";
//import TreeItem from "@material-ui/lab/TreeItem";
//import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@mui/material/styles";
import TreeView from "@mui/lab/TreeView";
import TreeItem from "@mui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useIsMount } from "../utils/utils";

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    // "&:focus > $content": {
    //   backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
    //   color: "var(--tree-view-color)"
    // }
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "$expanded > &": {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  group: {
    marginLeft: 0,
    "& $content": {
      paddingLeft: theme.spacing(2),
    },
  },
  expanded: {},
  label: {
    fontWeight: "inherit",
    color: "inherit",
  },
  labelRoot: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: "inherit",
    flexGrow: 1,
  },
}));

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    treeKey,
    isParent,
    id,
    ...other
  } = props;

  //added keyPlusClass because currently materialUI's tree view does not provide a way to grab nested tree item's id's
  //so here we make them available via classnames
  let keyPlusClass = `treeKey${treeKey}|`;
  return (
    <TreeItem
      label={
        <div className={`${keyPlusClass}`} style={{ color: "black" }}>
          <Typography
            className={`${keyPlusClass} ${isParent ? `parentTreeNode` : null}`}
          >
            {labelText}
          </Typography>
        </div>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      id={id}
      classes={{
        root: classes.root,
        content: `${classes.content} ${keyPlusClass} `,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

const useStyles = makeStyles({
  root: {
    height: (props) => props.height,
    flexGrow: 1,
    maxWidth: 400,
  },
});
/**
 * The point of getIndex is to pull out the id, to pass back to RTF to open the correct form
 * Material UI's TreeView component was not able to access nested TreeItem id's
 */
function getIndex(e) {
  let classList = e.target.className;
  if (typeof classList !== "object") {
    let indexPosition = classList.indexOf("treeKey");
    if (indexPosition > -1) {
      let pipeIndex = classList.indexOf("|");
      let treeIndex = classList.slice(indexPosition + 7, pipeIndex);
      return treeIndex;
    }
    return null;
  }
}
function getIndexFromParent(e) {
  let parentWithIndex = e.currentTarget.parentNode;
  let index = parentWithIndex.id.substring(8);
  return index;
}
//takes tree object and counts all forms and subforms, returns array of strings representing parent's index
//purpose is to create array to pass into defaultExpanded so forms will default to openo
function getFormCountArray(flattenArray) {
  let returnArray = [];
  flattenArray.forEach((item, index) => {
    if (item.children && item.children.length > 0) {
      returnArray.push(`${index}`);
    }
  });
  return returnArray;
}
function getFlatArray(treeObject) {
  let flattenArray = [];
  treeObject.forEach((item, index) => {
    flattenArray.push(item);
    if (item.children.length > 0) {
      item.children.forEach((child) => {
        child.parent = item.title;
        flattenArray.push(child);
      });
    }
  });
  return flattenArray;
}
function updateBackgroundColor(index, currentIndex) {
  document
    .getElementById(`treeItem${currentIndex}`)
    .classList.remove("setGreyBackground");
  document
    .getElementById(`treeItem${index}`)
    .classList.add("setGreyBackground");
}

function updatedBackgroundColorIfExists(currentIndex) {
  let classList = document.getElementById(`treeItem${currentIndex}`).classList;

  if (classList) {
    let hasBGclass = false;
    for (let i = 0; i < classList.length; i++) {
      if (classList[i] === "setGreyBackground") hasBGclass = true;
    }
    if (!hasBGclass) {
      document
        .getElementById(`treeItem${currentIndex}`)
        .classList.add("setGreyBackground");
    }
  }
}

export default React.memo(function TreeViewComp(props) {
  const [currentIndex, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [updateBGcolor, setUpdateBGcolor] = useState(false);
  const [currentFormName, setCurrentFormName] = useState(props.treeObject[0]);
  const classes = useStyles({ height: props.height - 48 });

  let counter = -1;
  let flattenArray = getFlatArray(props.treeObject);
  let formCountArray = getFormCountArray(flattenArray); //returns array of strings equivalent to parent forms index position
  //detects if component has been rendered previously
  //usefull if wanting to do something on first render
  const isMount = useIsMount();
  useEffect(() => {
    if (isMount) {
      //first render, set very first form as selected
      if (props.treeObject.length > 1) updateBackgroundColor(0, 1);
    } else {
      updateBackgroundColor(currentIndex, prevIndex);

      if (updateBGcolor) {
        updatedBackgroundColorIfExists(currentIndex);
        setUpdateBGcolor(false);
      }
    }
    console.log(currentFormName);
    props.updateBreadCrumb(currentFormName);
  });
  return (
    <TreeView
      className={classes.root}
      defaultExpanded={formCountArray}
      defaultCollapseIcon={
        <FontAwesomeIcon icon={faFolderOpen} style={{ color: "#e7d19c" }} />
      }
      defaultExpandIcon={
        <FontAwesomeIcon icon={faFolder} style={{ color: "#e7d19c" }} />
      }
      defaultEndIcon={<div style={{ width: 24 }} />}
      onNodeToggle={(e) => {
        let index = getIndexFromParent(e);
        if (index) {
          //round about way to set background color based on what is clicked
          if (currentIndex !== index) {
            setIndex(index);
            setPrevIndex(currentIndex);
          } else {
            setUpdateBGcolor(true);
          }
        }
      }}
    >
      {props.treeObject.map((item, index) => {
        counter = counter + 1;
        let bgColor = index % 2 === 0 ? "#b9d9f3" : "white";
        return (
          <StyledTreeItem
            key={index}
            nodeId={`${counter}`}
            labelText={item.title}
            id={`treeItem${counter}`}
            // labelIcon={MailIcon}
            onClick={(e) => {
              let index = getIndex(e);

              if (index) {
                //round about way to set background color based on what is clicked
                if (currentIndex !== index) {
                  setIndex(index);
                  setPrevIndex(currentIndex);
                }
                props.openForm(index);
                setCurrentFormName(flattenArray[index]);
              }
            }}
            isParent={true}
            treeKey={counter}
            style={{
              backgroundColor: bgColor,
            }}
          >
            {item.children.length > 0
              ? item.children.map((child, index) => {
                  let bgColor = index % 2 === 0 ? "#b9d9f3" : "white";
                  counter = counter + 1;
                  return (
                    <StyledTreeItem
                      //    labelIcon={Label}
                      className="subtreeItem"
                      isParent={false}
                      treeKey={counter}
                      key={index}
                      nodeId={`${counter}`}
                      labelText={child.title}
                      style={{
                        backgroundColor: bgColor,
                      }}
                      id={`treeItem${counter}`}
                      onClick={(e) => {
                        let index = getIndex(e);
                        if (index) {
                          if (currentIndex !== index) {
                            setIndex(index);
                            setPrevIndex(currentIndex);
                          }
                          props.openForm(index);
                          setCurrentFormName(flattenArray[index]);
                        }
                      }}
                    />
                  );
                })
              : null}
          </StyledTreeItem>
        );
      })}
    </TreeView>
  );
});
