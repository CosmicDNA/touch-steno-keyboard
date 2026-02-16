# Touchscreen Stenography Keyboard

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/touch-steno-keyboard)
![GitHub License](https://img.shields.io/github/license/CosmicDNA/touch-steno-keyboard)
[![DeepScan grade](https://deepscan.io/api/teams/23301/projects/31036/branches/1003311/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=23301&pid=31036&bid=1003311)

## Repository

This code repository is hosted at https://github.com/CosmicDNA/touch-steno-keyboard

## Purpose of The Project

The aim of this project is to render with React Three Fiber a usefull stenography touchscreen keyboard. So that users can safely send keystrokes to whichever computer running Plover they want.

This is a cross-platform touchscreen stenography keyboard built in React, making it a web-based solution that can run on any device with a touchscreen and a browser (Android, iOS, Windows tablets, etc.).

The idea is to provide a secure, highly accessible, zero-cost practice tool that people can use anywhere. It outputs steno strokes that can be picked up by Plover (via the WebSocket connection).

## Deployed Application

The application was deployed to Vercel and is available at:

https://touch.stenography.cosmicdna.co.uk

## How It Works

This application functions as a web-based stenography keyboard that securely connects to the [Plover](https://github.com/openstenoproject/plover) stenography engine. It uses a [Cloudflare worker](https://github.com/CosmicDNA/plover-websocket-relay) to establish a secure, encrypted connection via durable objects, allowing you to send steno strokes from your browser to Plover running on any machine.

![Plover way](assets/20240413_151518.png)
*Plover way in Cornish*

## Setup Guide

Follow these steps to connect the web keyboard to Plover.

### Step 1: Install and Configure the Plover Touch Tablets Plugin

1.  **Install the Plugin**: The recommended way to install [touch-tablets plugin](https://github.com/CosmicDNA/plover-touch-tablets) is through Plover's built-in Plugin Manager.
    -   In Plover, go to **Tools -> Plugins Manager**.
    -   Find and select **plover-touch-tablets**.
    -   Click **Install/Update**, and then **Restart** Plover. -->

> [!TIP]
> Alternativelly, to install the plugin use the `plover_console` command from within your Plover installation folder as follows:
>
> ```PowerShell
> .\plover_console -s plover_plugins install git+https://github.com/CosmicDNA/plover-touch-tablets.git
> ```

2.  **Enable the Steno Tablets Plugin**:
    -   In Plover's main window, click the **Configure** button (the gear icon).
    -   Go to the **Plugins** tab.
    -   Makse sure the *Enabled* check box is ticked as per the following image.


<p align="center">
  <a href="assets/Plover enabled plugin.png">
    <img src="assets/Plover enabled plugin.png" alt="Enabled Steno Tables Plugin" />
  </a>
  <br/>
  <em>Enabled Websocket Server Plugin</em>
</p>

### Step 2: Open Tablet QR Tool

From Plover's tools, open the Tablet QR by clicking on the tool with the Plover logo as indicated:

<p align="center">
  <a href="assets/Tablet QR Tool.png">
    <img src="assets/Tablet QR Tool.png" alt="Open Tablet Connection QR Code" />
  </a>
  <br/>
  <em>Open Tablet Connection QR Code</em>
</p>

### Step 3: Scan the QR code with the Tablet's camera

With your tablet, scan the QR code to open up the touch keyboard application. Here is an example QR code for the connection.

<p align="center">
  <a href="assets/Tablet Connection QR Code.png">
    <img src="assets/Tablet Connection QR Code.png" alt="Tablet QR Code Window" width="300"/>
  </a>
  <br/>
  <em>Tablet QR Code Window</em>
</p>

> [!TIP]
> You can connect 2 tablets to form a split setup. Everytime a new tablet is connected, the QR code is updated.



### Step 4: Configure the Web Keyboard

Open the web keyboard application in the connected tablet(s) and click the settings icon. The default values are shown below.

<p align="center">
  <a href="assets/Configure web-socket connection.png">
    <img src="assets/Configure web-socket connection.png" alt="App configuration window" />
  </a>
  <br/>
  <em>App configuration window</em>
</p>

#### Keyboard Controls Explained

Within the "Keyboard" controls panel, you'll find several options to customize your experience:

-   **sendStroke**: This dropdown controls *when* the steno stroke is sent to Plover.
    -   `onKeyRelease` (Default): The stroke is sent after you lift your fingers off the screen, when the last key in the chord is released. This is the standard behavior for stenography and allows you to form the full chord before sending.
    -   `onKeyPress`: The stroke is sent the moment you press the first key. This offers a more immediate response but may be less forgiving if you don't press all keys in a chord simultaneously.

-   **lockPosition**: When checked, this option freezes the camera's position, preventing you from accidentally rotating, panning, or zooming the 3D view. This is useful once you've found a comfortable angle.

-   **performanceMonitor**: Ticking this box will display a small panel in the bottom-right corner showing real-time performance metrics like Frames Per Second (FPS). This is mainly useful for development or for diagnosing performance issues on your device.

-   **show3DText**: This toggles the visibility of the text labels on top of each key. You can turn this off for a cleaner, more minimalist look once you are familiar with the key layout.

-   **showShadows**: This option enables or disables the soft contact shadows beneath the keyboard. Disabling shadows can improve performance on less powerful devices, but will make the scene look less realistic.


## Usage Example

Once connected, you can begin typing on the touchscreen keyboard. The video below demonstrates the keyboard in action.

https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/c5960847-21dc-412f-a4d8-af9af335dbce

*Usage example for typing*

### Lookup Mode

This application includes a lookup mode for use once the app is connected to Plover. To use it simply append `?lookup=` followed by the lookup phrase you want.

For example: https://touch.stenography.cosmicdna.co.uk/?lookup=`Hello to you all!` results in:

<p align="center">
  <a href="assets/lookup%20mode.png">
    <img src="assets/lookup%20mode.png" alt="Lookup Mode" />
  </a>
  <br/>
  <em>The lookup mode is entered upon using a lookup URL search parameter.</em>
</p>

Where the strokes are pressed rythmically suggesting the user to type with perhaps the most efficient typing chords.

## Development

![touchscreen-stenography-keyboard-build](https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/1f1da328-26f4-4ca3-8055-f623a19b7edb)
*How to start the server in production mode*

### Running

In your terminal run:
```shell
yarn && yarn start
```

### Building

```shell
yarn build
yarn global add serve
```

### Serving Production Build

```shell
NODENV=production && serve -s build
```

## Powered by

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
![Vercel Deploy](https://img.shields.io/badge/vercel-repo?logo=vercel&color=black&style=for-the-badge)