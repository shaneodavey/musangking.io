import Dashboard from './pages/Dashboard';
import Trees from './pages/Trees';
import TreeProfile from './pages/TreeProfile';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AddTree from './pages/AddTree';
import EditTree from './pages/EditTree';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Trees": Trees,
    "TreeProfile": TreeProfile,
    "Tasks": Tasks,
    "Analytics": Analytics,
    "Settings": Settings,
    "AddTree": AddTree,
    "EditTree": EditTree,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};