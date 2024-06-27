import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaUserAlt,
  FaNewspaper,
  FaDollarSign,
  FaCog,
  FaListUl,
  FaFlag,
} from "react-icons/fa";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

const AdminSidebar = () => {
  return (
    <div
      style={{
        display: "flex",
        overflowX: "hidden",
        position: "fixed",
        width: "20vw",
        height: "100vh",
      }}
    >
      <Sidebar>
        <Menu
          menuItemStyles={{
            button: {
              [`&.active`]: { backgroundColor: "#7a7a7a", color: "#e8e8e8" },
            },
          }}
        >
          <MenuItem
            icon={<FaChartBar />}
            component={<NavLink />}
            to="/admin/dashboard"
          >
            Dashboard
          </MenuItem>
          <MenuItem
            icon={<FaUserAlt />}
            component={<NavLink />}
            to="/admin/users"
          >
            Pengguna
          </MenuItem>
          <MenuItem
            icon={<FaNewspaper />}
            component={<NavLink />}
            to="/admin/posts"
          >
            Topik
          </MenuItem>
          <MenuItem
            icon={<FaDollarSign />}
            component={<NavLink />}
            to="/admin/ads"
          >
            Iklan
          </MenuItem>
          <MenuItem
            icon={<FaListUl />}
            component={<NavLink />}
            to="/admin/categories"
          >
            Kategori
          </MenuItem>
          <MenuItem
            icon={<FaFlag />}
            component={<NavLink />}
            to="/admin/reporteds"
          >
            Terlapor
          </MenuItem>
          {/* <SubMenu icon={<FaCog />} label="Pengaturan">
            <MenuItem> Pie charts </MenuItem>
            <MenuItem> Line charts </MenuItem>
          </SubMenu> */}
        </Menu>
      </Sidebar>
    </div>
  );
};

export default AdminSidebar;
