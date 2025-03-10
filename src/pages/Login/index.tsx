//Formik
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useNavigate } from 'react-router-dom';
//import ThemeSwitcher from "@/components/ThemeSwitcher";
import logoUrl from "@/assets/images/EnWise_Logo_white-min.png";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Cookies from 'js-cookie';
import clsx from "clsx";


function Main() {
  const navigate = useNavigate();
  //Formik Validation
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username field is required'),
      password: Yup.string().required('Password field is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Log the data being sent for debugging
        console.log('Form submission values:', values);

        // Create a FormData object to send data as form data
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('password', values.password);

        const response = await fetch('http://127.0.0.1:8000/api/admin/login', {
          method: 'POST',
          body: formData, // Send form data directly without Content-Type header
        });

        // Log the raw response for debugging
        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error('Login failed');
        }

        // Assuming the response contains a role to set in cookies
        Cookies.set('roles', data.role || 'admin');
        navigate('/sites');
        console.log('Login successful:', data);
      } catch (error) {
        // Provide more detail in error logging
        console.error('Error logging in:', error);
        alert(`Login failed: ${Error}`);
      }
    },
  });

  return (
    <>
      <div
        className={clsx([
          "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        {/* <ThemeSwitcher /> */}
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Login Info */}
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href="" className="flex items-center pt-5 -intro-x">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  style={{ width: '200px' }}
                  src={logoUrl}
                />
              </a>
              <div className="my-auto">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="w-1/2 -mt-16 -intro-x"
                  src={illustrationUrl}
                />
                <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                  A few more clicks to <br />
                  sign in to your account.
                </div>
                <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                  {/* Manage all your e-commerce accounts in one place */}
                </div>
              </div>
            </div>
            {/* END: Login Info */}
            {/* BEGIN: Login Form */}
            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                  Sign In
                </h2>
                <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                  A few more clicks to sign in to your account. Manage all your
                  e-commerce accounts in one place
                </div>
                <form onSubmit={formik.handleSubmit}>
                  <div className="mt-8 intro-x">
                    <FormInput
                      type="text"
                      name="username"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.username}
                      className={`block px-4 py-3 intro-x min-w-full xl:min-w-[350px] ${formik.touched.username && formik.errors.username ? 'border-danger' : ''
                        }`}
                      placeholder="Username"
                    />
                    {formik.touched.username && formik.errors.username ? (
                      <div className="mt-2 text-danger">{formik.errors.username}</div>
                    ) : null}
                    <FormInput
                      type="password"
                      name="password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      className={`block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px] ${formik.touched.password && formik.errors.password ? 'border-danger' : ''
                        }`}
                      placeholder="Password"
                    />
                    {formik.touched.password && formik.errors.password ? (
                      <div className="mt-2 text-danger">{formik.errors.password}</div>
                    ) : null}
                  </div>
                  {/* <div className="flex mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                    <div className="flex items-center mr-auto">
                      <FormCheck.Input
                        id="remember-me"
                        type="checkbox"
                        className="mr-2 border"
                      />
                      <label
                        className="cursor-pointer select-none"
                        htmlFor="remember-me"
                      >
                        Remember me
                      </label>
                    </div>
                    <a href="">Forgot Password?</a>
                  </div> */}
                  <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                    <Button type="submit"
                      variant="primary"
                      className="w-full px-4 py-3 align-top xl:w-32 xl:mr-3">
                      Login
                    </Button>
                    {/* <Button
                    variant="outline-secondary"
                    className="w-full px-4 py-3 mt-3 align-top xl:w-32 xl:mt-0"
                  >
                    Register
                  </Button> */}
                  </div>
                </form>
                <div className="mt-10 text-center intro-x xl:mt-24 text-slate-600 dark:text-slate-500 xl:text-left">
                  By signing up, you agree to our{" "}
                  <a className="text-primary dark:text-slate-200" href="">
                    Terms and Conditions
                  </a>{" "}
                  &{" "}
                  <a className="text-primary dark:text-slate-200" href="">
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
