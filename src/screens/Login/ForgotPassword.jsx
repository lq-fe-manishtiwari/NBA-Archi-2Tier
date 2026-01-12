import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import Logo from '@/_assets/New_images/Login/LQ_LOGO_NEW.png';
import bg_part_2 from '@/_assets/New_images/Login/reset_pwd.svg';
import { authenticationService } from "@/_services/api";

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is Required'),
});

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

//   Redirect if already logged in
  useEffect(() => {
    if (authenticationService.currentUserValue) {
      navigate('/');
    }
  }, [navigate]);

//   SweetAlert Helpers
  const showSuccess = () => {
    setAlert(
      <SweetAlert
        success
        title="Email Sent!"
        onConfirm={() => setAlert(null)}
      >
        Check your inbox. A new password has been sent.
      </SweetAlert>
    );
  };

  const showError = (msg) => {
    setAlert(
      <SweetAlert
        danger
        title="Request Failed"
        onConfirm={() => setAlert(null)}
      >
        {msg}
      </SweetAlert>
    );
  };

  const onSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {

      const result = await authenticationService.forgotPassword(values);
      if (result.status === 200) {
        showSuccess();
      } else {
        throw new Error('User is not Registered!!');
      }
    } catch (err) {
      showError(err.message || 'Server error');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
      {/* LEFT SIDE - IMAGE ONLY */}
      <div className="hidden md:flex items-center justify-center  rounded-l-4xl overflow-hidden">
        <img
          src={bg_part_2}
          alt="Reset password background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 md:py-0 bg-primary-1000 md:rounded-l-4xl">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="mb-3 text-center md:text-left">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-2">
              <img src={Logo} alt="Logo" className="h-12 mx-auto md:mx-0" />
            </h1>
            <p className="text-primary-100 text-lg md:text-3xl">Forgot Password?</p>
            <p className="text-primary-100 mt-5 mb-5 text-sm md:text-lg">
             Simply enter your username

and we will send you your new password.
            </p>
          </div>

          {/* Form */}
          <Formik
            initialValues={{ username: '' }}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Input */}
                <div className="relative">
                  <label className="block text-white text-xs font-semibold mb-2 uppercase tracking-wide">
                    Enter Your Username
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="username@learnqoch.com"
                      disabled={loading}
                      className={`w-full bg-white bg-opacity-15 border-2 border-white border-opacity-30 text-white placeholder-primary-200 px-4 py-3 rounded-2xl focus:outline-none focus:border-white focus:border-opacity-100 focus:bg-opacity-20 transition-all backdrop-blur-sm ${
                        errors.username && touched.username ? 'border-red-500' : ''
                      }`}
                    />
                    <Mail className="absolute right-4 w-5 h-5 text-primary-100 pointer-events-none" />
                  </div>
                  {errors.username && touched.username && (
                    <p className="mt-1 text-red-400 text-sm">{errors.username}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-105 active:scale-95 duration-200 text-base ${
                    loading || isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed transform-none'
                      : 'bg-white text-primary-600 hover:bg-primary-50 hover:shadow-xl'
                  }`}
                >
                  {loading ? 'Sending...' : 'Reset my password'}
                </button>
              </form>
            )}
          </Formik>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-primary-100 hover:text-white text-sm font-medium transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* SweetAlert */}
      {alert}
    </div>
  );
}