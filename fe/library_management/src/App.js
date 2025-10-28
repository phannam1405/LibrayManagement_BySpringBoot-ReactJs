import { Route, Switch } from 'react-router-dom';
import './App.css';
import Login from './auth/Login';
import RequireAuth from './auth/RequireAuth';
import AdminDashBoard from './admin/pages/AdminDashBoard';
import AddNewBookCategory from './admin/pages/AddNewBookCategory';
import ListBookCategory from './admin/pages/ListBookCategory';
import AddNewBook from './admin/pages/AddNewBook';
import ListBooks from './admin/pages/ListBooks';
import EditBook from './admin/pages/EditBook';
import CreateUserWithRoles from './admin/pages/CreateUserWithRoles ';
import AddPermission from './admin/pages/AddPermission';
import ListPermissions from './admin/pages/ListPermissions';
import AddRole from './admin/pages/AddRole';
import ListRoles from './admin/pages/ListRoles';
import EditRole from './admin/pages/EditRole';
import ListUserAndEmployee from './admin/pages/ListUserAndEmployee';
import MyProfile from './admin/pages/MyProfile';
import BorrowBook from './admin/pages/BorrowBook';
import ListBorrow from './admin/pages/ListBorrow';
import HomePage from './user/pages/HomePage';
import BookDetails from './user/pages/BookDetails';
import Register from './user/pages/Register';
import UserProfile from './user/pages/UserProfile';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/login" component={Login} />

        <Route exact path="/">
          <HomePage />
        </Route>

        <Route exact path="/admin-dashboard">
          <RequireAuth>
            <AdminDashBoard />
          </RequireAuth>
        </Route>


        <Route exact path="/add-new-book-category">
          <RequireAuth>
            <AddNewBookCategory />
          </RequireAuth>
        </Route>

        <Route exact path="/list-book-categories">
          <RequireAuth>
            <ListBookCategory />
          </RequireAuth>
        </Route>

        <Route exact path="/add-new-book">
          <RequireAuth>
            <AddNewBook />
          </RequireAuth>
        </Route>
        <Route exact path="/list-books">
          <RequireAuth>
            <ListBooks />
          </RequireAuth>
        </Route>
        <Route exact path="/edit-book/:id">
          <RequireAuth>
            <EditBook />
          </RequireAuth>
        </Route>
        <Route exact path="/add-employee">
          <RequireAuth>
            <CreateUserWithRoles />
          </RequireAuth>
        </Route>
        <Route exact path="/add-role">
          <RequireAuth>
            <AddRole></AddRole>
          </RequireAuth>
        </Route>
        <Route exact path="/add-permission">
          <RequireAuth>
            <AddPermission />
          </RequireAuth>
        </Route>
        <Route exact path="/list-permissions">
          <RequireAuth>
            <ListPermissions />
          </RequireAuth>
        </Route>
        <Route exact path="/list-roles">
          <RequireAuth>
            <ListRoles />
          </RequireAuth>
        </Route>

        <Route exact path="/edit-role/:roleName">
          <RequireAuth>
            <EditRole />
          </RequireAuth>
        </Route>
        <Route exact path="/list-user-emp">
          <RequireAuth>
            <ListUserAndEmployee />
          </RequireAuth>
        </Route>

        <Route exact path="/my-info">
          <RequireAuth>
            <MyProfile />
          </RequireAuth>
        </Route>
        <Route exact path="/borrow-book">
          <RequireAuth>
            < BorrowBook />
          </RequireAuth>
        </Route>
        <Route exact path="/list-borrow">
          <RequireAuth>
            <  ListBorrow />
          </RequireAuth>
        </Route>
        <Route exact path="/details/:id">
          <RequireAuth>
            <BookDetails />
          </RequireAuth>
        </Route>

        <Route exact path="/register">
          <Register />
        </Route>

        <Route exact path="/my-profile">
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
