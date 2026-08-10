import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Error Info:", errorInfo);

    // You can send error details to an error-monitoring service here.
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mb-4 text-5xl">⚠️</div>

            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Something went wrong
            </h1>

            <p className="mb-6 text-gray-500">
              We couldn't load this part of the application.
            </p>

            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 overflow-auto rounded-lg bg-gray-100 p-4 text-left text-xs text-red-500">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;



// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       hasError: false,
//     };
//   }

//   static getDerivedStateFromError(error) {
//     return {
//       hasError: true,
//     };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.log(error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return <FallbackUI />;
//     }
//     return this.props.children;
//   }
// }