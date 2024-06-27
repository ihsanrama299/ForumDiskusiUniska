import UserRegister from "./components/UserRegister";

const Register = () => {
  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ backgroundColor: "#e0e0e0", minHeight: "100vh" }}
    >
      <UserRegister />
    </div>
  );
};

export default Register;
