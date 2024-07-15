import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";

const useStyles = makeStyles({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400
  }
});

export default function FileSystemNavigator(props) {
  const classes = useStyles();
  let counter = 0;
  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {props.treeObject.map((item, index) => {
        counter = counter + 1;

        return (
          <TreeItem key={index} nodeId={`${counter}`} label={item.title}>
            {item.children.length > 0
              ? item.children.map((child, index) => {
                  counter = counter + 1;
                  return (
                    <TreeItem
                      key={index}
                      nodeId={`${counter}`}
                      label={child.title}
                    />
                  );
                })
              : null}
          </TreeItem>
        );
      })}
    </TreeView>
  );
}
