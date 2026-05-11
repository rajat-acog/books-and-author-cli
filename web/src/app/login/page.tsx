// "use client";

// import { AuthLogin } from "@aganitha/authentication-component";

// export default function LoginPage() {
//   return (
//     <div className="login-page min-h-screen flex items-center justify-center px-4">

//       <div className="login-card w-full max-w-md">

//         {/* Header */}
//         <div className="login-header">
//           <h1>📚 Book AI</h1>
//           <p>Smart summaries, instantly</p>
//         </div>

//         {/* Auth Component */}
//         <div className="auth-fix">
//           <AuthLogin
//             title="Welcome"
//             subtitle="Login to explore book summaries"
//             redirectUrl="/dashboard"
//             showGoogle={false}
//             showGithub={false}
//             showLinkedin={false}
//             showLDAP={true}
//             showOTP={true}
//             ldapDomain="aganitha.ai"
//           />
//         </div>

//         {/* Footer */}
//         <p className="login-footer">
//           By continuing, you agree to our Terms & Privacy Policy
//         </p>

//       </div>
//     </div>
//   );
// }

"use client";

import { AuthLogin } from "@aganitha/authentication-component";

export default function LoginPage() {
  return (
    <div
      className="login-page min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
      }}
    >

      <div className="login-card w-full max-w-md">

        {/* Header */}
        <div className="login-header">
          <h1>📚 Book AI</h1>
          <p>Smart summaries, instantly</p>
        </div>

        {/* Auth Component */}
        <div className="auth-fix">
          <AuthLogin
            title="Welcome"
            subtitle="Login to explore book summaries"
            redirectUrl="/dashboard"
            showGoogle={false}
            showGithub={false}
            showLinkedin={false}
            showLDAP={true}
            showOTP={true}
            ldapDomain="aganitha.ai"
          />
        </div>

        {/* Footer */}
        <p className="login-footer">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}