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
    padding: 10px 8px;
    padding-right: 18px;
    position: sticky;
    background: none;
    transition: all 280ms ease;
    -webkit-transition: all 280ms ease;
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

  #encryptionInput {
    position: relative;
    width: 280px;
    height: 40px;
    overflow: hidden;
    margin-left: 16px;
    border-radius: 5px;
    background-color: #ff2949;
    -webkit-transition: all 280ms ease 10ms;
    transition: all 280ms ease 10ms;
  }

  #encryptionInput svg {
    position: absolute;
    cursor: pointer;
    top: 8px;
    left: 10px;
    z-index: 1;
  }

  #encryptionInput input {
    position: absolute;
    top: 0px;
    left: 34px;
    width: 100%;
    height: 100%;
    border: none;
    text-indent: 4px;
    border-radius: 5px;
    background-color: #ff2949;
    -webkit-transition: all 280ms ease;
    transition: all 280ms ease;
    outline: 0px !important;
    -webkit-appearance: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    resize: none;
    color: #ddd;
    font-size: 0.88em;
    padding: 1px 8px;
    white-space: nowrap;
  }
  #encryptionInput input::placeholder {
    color: #ddd;
  }

  #encryptionInput.nice-password,
  #encryptionInput.nice-password input {
    background-color: rgb(67, 181, 129);
  }

  .decrypted {
    color: #43b581 !important;
  }
  .decrypted a {
    color: #1c9c6d !important;
  }
  .not-decrypted {
    color: #ff2949 !important;
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
    transition: all 280ms ease 40ms;
    -webkit-transition: all 280ms ease 40ms;
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
