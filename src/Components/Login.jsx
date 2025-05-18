import React, { useState } from "react";
import "./Login.css";
import logo from "./../Assets/translogo.png";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let emailError = "";
    let passwordError = "";

    if (!validateEmail(email)) {
      emailError = "Invalid email format";
    }

    if (!password) {
      passwordError = "Password is required";
    }

    if (emailError || passwordError) {
      setError({ email: emailError, password: passwordError });

      const errorMessage = [emailError, passwordError]
        .filter(Boolean)
        .join("\n");

      Swal.fire({
        title: "Error!",
        text: errorMessage || "Invalid credentials",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#1E306D",
      });

      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4001/api/users/signin",
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );

      if (
        response.data.status === "success" &&
        response.data.data.user.status === "Active"
      ) {
        const token = response.data.data.user._id;
        document.cookie = `token=${token}; path=/;`;

        const roleName = response.data.data.user.role.name;
        switch (roleName) {
          case "ADMIN":
            Swal.fire({
              title: "Success!",
              text: "Login Successful!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/admin-dashboard");
            break;
          case "USER":
            if (response.data.data.user.otpVerified === true) {
              Swal.fire({
                title: "Success!",
                text: "Login Successful!",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
              });
              navigate("/bookingForm");
            } else {
              Swal.fire({
                title: "User Email Not Verified!",
                text: `Please check your email to verify your account with the OTP!`,
                icon: "info",
                showConfirmButton: false,
                timer: 3000,
              });

              setTimeout(() => {
                navigate("/otpEmail", {
                  state: { email: response.data.data.user.email },
                });
              }, 3000);
            }
            break;
          case "SUPER ADMIN":
            Swal.fire({
              title: "Success!",
              text: "Login Successful!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/admin-add");
            break;
          case "CHECKIN STAFF":
            Swal.fire({
              title: "Success!",
              text: "Login Successful!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/checkin-schedules");
            break;
          case "PILOT":
            Swal.fire({
              title: "Success!",
              text: "Login Successful!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/pilot-schedule");
            break;
          case "GENERAL MANAGER":
            Swal.fire({
              title: "Success!",
              text: "Login Successful!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
            navigate("/gm-dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: "Your account is not activated. Please contact our customer service for further help.",
          icon: "info",
          confirmButtonColor: "#1E306D",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response
          ? error.response.data
          : "An error occurred during login",
        icon: "error",
        confirmButtonColor: "#1E306D",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="right-side">
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`login-input ${error.email ? "input-error" : ""}`}
              placeholder="Email"
              value={email}
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setError({ ...error, email: "" });
              }}
            />

            <label htmlFor="password">Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`login-input ${error.password ? "input-error" : ""}`}
                placeholder="Password"
                value={password}
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError({ ...error, password: "" });
                }}
              />
              <span
                className="login-password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <BsEye size={20} /> : <BsEyeSlash size={20} />}
              </span>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>

            <div className="signup-link">
              Don't have an account?{" "}
              <a href="/register" className="sign-up">
                Sign Up
              </a>
            </div>
          </form>
        </div>

        <Link to={"/"} className="change-right-side">
          <div className="change-logo">
            <img src={logo} alt="Logo" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Login;
