import React from "react";
import DropdownItem from "../components/navbar/navitem";
import renderer from "react-test-renderer";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navitems render correctly", () => {
  const component = renderer.create(
    <DropdownItem
      printFile={() => {}}
      onUpload={() => {}}
      onSaveFile={() => {}}
      onLegendClick={() => {}}
      onChangeLayout={() => {}}
      itemList={["testing"]}
      user={{ userID: "abc", access: [] }}
      key={1}
      name="item"
      isDisabled={true}
      styleProps={{ color: "green" }}
      subMenus={{
        Layout: ["test", "abc"],
        Show_Hide: ["testing", "123"]
      }}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  //simulate click on child
  tree[1].children[0].props.onClick();
  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  // blur on child
  tree[1].children[0].props.onBlur();
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  //mouse leave on child
  tree[1].children[1].props.onMouseLeave();
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  //mouse enter on grandchild
  tree[1].children[1].children[0].children[0].props.onMouseEnter();
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
