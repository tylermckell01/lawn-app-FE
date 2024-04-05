import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function NewUserForm() {
  const [userData, setUserData] = useState([]);
  const [editedUserData, setEditedUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let authToken = Cookies.get("auth_token");
    const response = await fetch("http://127.0.0.1:8086/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      await fetchUserData();
      console.log("create new user successful");
      console.log(response);
      return response;
    } else {
      console.error("create new user failed");
    }
  };

  const fetchUserData = async () => {
    let authToken = Cookies.get("auth_token");
    await fetch("http://127.0.0.1:8086/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.result);
      });
  };

  const handleFieldUpdate = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditedUserData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((previous) => ({ ...previous, [name]: value }));
    }
  };

  const addUserForm = () => {
    return (
      <div className="new-user-form-container">
        <div className="page-title">new user form</div>
        <form onSubmit={handleSubmit}>
          <div className="new-user-form">
            <label htmlFor="new-user-first-name"> first name </label>
            <input
              id="new-user-first-name"
              name="first_name"
              value={formData.first_name}
              type="text"
              className="user-first-name"
              onChange={handleFieldUpdate}
            />

            <label htmlFor="new-user-last-name"> last name </label>
            <input
              id="new-user-last-name"
              name="last_name"
              value={formData.last_name}
              type="text"
              className="user-last-name"
              onChange={handleFieldUpdate}
            />

            <label htmlFor="new-user-email"> email </label>
            <input
              id="new-user-email"
              name="email"
              value={formData.email}
              type="text"
              className="user-email"
              onChange={handleFieldUpdate}
            />

            <label htmlFor="new-user-password"> password </label>
            <input
              id="new-user-password"
              name="password"
              value={formData.password}
              type="text"
              className="user-password"
              onChange={handleFieldUpdate}
            />

            <label htmlFor="new-user-role"> role </label>
            <input
              id="new-user-role"
              name="role"
              value={formData.role}
              type="text"
              className="user-role"
              onChange={handleFieldUpdate}
            />

            <button type="submit">Add this user!</button>
          </div>
        </form>
      </div>
    );
  };

  const editUserData = async (user) => {
    let authToken = Cookies.get("auth_token");

    const response = await fetch(`http://127.0.0.1:8086/user/${user.user_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
      body: JSON.stringify(editedUserData),
    });

    if (response) {
      await fetchUserData();
      setIsEditing(false);
      return response;
    } else {
      console.error("Update User failed");
    }
  };

  const deleteUser = async (user) => {
    let authToken = Cookies.get("auth_token");

    const response = await fetch(
      `http://127.0.0.1:8086/user/delete/${user.user_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          auth: authToken,
        },
      }
    );

    console.log("deleting user:", user);

    if (response.ok) {
      await fetchUserData();
      return response;
    } else {
      console.error("DELETE User failed");
    }
  };

  const editUser = () => {
    setIsEditing(true);
  };

  const renderUserData = () => {
    if (userData.length === 0) {
      return <div>No User Data</div>;
    }

    return userData?.map((user, idx) => {
      return (
        <div className="user-wrapper" key={idx}>
          {isEditing ? (
            <input
              id="editing-first-name"
              name="editing-first_name"
              defaultValue={user.first_name}
              type="text"
              className="editing-user-name"
              onChange={(e) =>
                setEditedUserData({
                  ...editedUserData,
                  first_name: e.target.value,
                })
              }
            />
          ) : (
            <div className="first-name">First name: {user.first_name}</div>
          )}
          {isEditing ? (
            <input
              id="editing-last-name"
              name="editing-last_name"
              defaultValue={user.last_name}
              type="text"
              className="editing-user-name"
              onChange={(e) =>
                setEditedUserData({
                  ...editedUserData,
                  last_name: e.target.value,
                })
              }
            />
          ) : (
            <div className="last-name">Last name: {user.last_name}</div>
          )}
          {isEditing ? (
            <input
              id="editing-email"
              name="editing-email"
              defaultValue={user.email}
              type="text"
              className="editing-user-name"
              onChange={(e) =>
                setEditedUserData({
                  ...editedUserData,
                  email: e.target.value,
                })
              }
            />
          ) : (
            <div className="email">Email: {user.email}</div>
          )}
          {isEditing ? (
            <input
              id="editing-role"
              name="editing-role"
              defaultValue={user.role}
              type="text"
              className="editing-user-name"
              onChange={(e) =>
                setEditedUserData({
                  ...editedUserData,
                  role: e.target.value,
                })
              }
            />
          ) : (
            <div className="role">Role: {user.role}</div>
          )}

          {isEditing ? (
            <button
              onClick={() => {
                editUserData(user);
                setIsEditing(false);
              }}
            >
              Save
            </button>
          ) : (
            <button onClick={() => editUser()}>Edit</button>
          )}
          <button onClick={() => deleteUser(user)}>delete</button>
        </div>
      );
    });
  };

  return (
    <div className="user-page-container">
      <div className="user-form">{addUserForm()}</div>
      <div className="existing-users">{renderUserData()}</div>
    </div>
  );
}
