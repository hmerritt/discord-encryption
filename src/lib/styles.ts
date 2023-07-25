// @ts-nocheck

/**
 * Passthrough tag literal. Useful for syntax highlighting only.
 */
const css = (strings, ...values) => String.raw({ raw: strings }, ...values);

/*
 * CSS styles
 */
export const styles = css`
  form div[class^="attachWrapper"] {
    display: flex;
  }

  .encryptionButton {
    top: 0;
    height: 44px;
    padding: 10px 12px;
    position: sticky;
    background: none;
    border-left: 1px solid var(--background-primary);
    -webkit-transition: all 280ms ease;
    transition: all 280ms ease;
  }
  .encryptionButton svg {
    width: 24px;
    height: 24px;
  }

  .encryptionButton[state="true"] path {
    fill: #43b581;
  }
  .encryptionButton[state="false"] path {
    fill: #b9bbbe;
  }

  .encryptionButton[state="true"]:hover path {
    fill: #1c9c6d;
  }
  .encryptionButton[state="false"]:hover path {
    fill: #dedede;
  }

  .updatePanel {
    position: absolute;
    display: flex;
    align-items: center;
    top: 15px;
    left: 0px;
    width: 100%;
    height: 40px;
    z-index: 10;
    overflow: hidden;
    cursor: pointer;
    border-radius: 5px;
    background-color: #7289da;
    -webkit-user-select: none;
    user-select: none;
    -webkit-transition: all 280ms ease 40ms;
    transition: all 280ms ease 40ms;
  }
  .updatePanel:hover {
    background-color: #677bc4;
  }
  .updatePanel:active {
    background-color: #5b6eae;
  }

  .updatePanel h2 {
    color: #fff;
    font-size: 0.85em;
    margin-left: 1.2em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .updatePanel span[action="close"] {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 77px;
    height: 24px;
    white-space: nowrap;
    margin-right: 1.2em;
    margin-left: auto;
    border-radius: 3px;
    border: 1px solid #fff;
    text-align: center;
    font-size: 0.85em;
    color: #fff;
  }
  .updatePanel span[action="close"]:hover {
    color: #7289da;
    background-color: #fff;
  }

  .animated {
    animation-duration: 280ms;
    animation-fill-mode: both;
    -webkit-animation-duration: 280ms;
    -webkit-animation-fill-mode: both;
  }

  .fadeInUp {
    opacity: 0;
    animation-name: fadeInUp;
    -webkit-animation-name: fadeInUp;
  }
  .fadeOutDown {
    opacity: 1;
    animation-name: fadeOutDown;
    -webkit-animation-name: fadeOutDown;
  }

  @keyframes fadeInUp {
    from {
      transform: translate3d(0, -6px, 0);
    }

    to {
      transform: translate3d(0, -16px, 0);
      opacity: 1;
    }
  }
  @-webkit-keyframes fadeInUp {
    from {
      transform: translate3d(0, -6px, 0);
    }

    to {
      transform: translate3d(0, -16px, 0);
      opacity: 1;
    }
  }
  @keyframes fadeOutDown {
    from {
      transform: translate3d(0, -16px, 0);
    }

    to {
      transform: translate3d(0, -6px, 0);
      opacity: 0;
    }
  }
  @-webkit-keyframes fadeOutDown {
    from {
      transform: translate3d(0, -16px, 0);
    }

    to {
      transform: translate3d(0, -6px, 0);
      opacity: 0;
    }
  }
`;
