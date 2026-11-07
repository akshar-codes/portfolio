import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-page" role="alert" aria-labelledby="error-title">
          <section className="error-page__card">
            <p className="error-page__eyebrow">
              <span aria-hidden="true" /> APPLICATION ERROR
            </p>
            <p className="error-page__code" aria-hidden="true">
              500
            </p>
            <h1 id="error-title">Something went wrong</h1>
            <p className="error-page__message">
              An unexpected error occurred. Please refresh the page.
            </p>
            <div className="error-page__actions">
              <button
                className="error-page__button error-page__button--primary"
                type="button"
                onClick={() => window.location.reload()}
              >
                Try again <span aria-hidden="true">↻</span>
              </button>
              <a
                className="error-page__button error-page__button--secondary"
                href="/"
              >
                Go home <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
