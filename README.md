# cBioPortal Installation Map

## Table of Contents

- [General information](#general-information)
- [Technologies](#technologies)
- [Setup](#setup)

## General information

This project features successful user installations of [cBioPortal](https://www.cbioportal.org/), as indicated by data from the [cBioPortal Deployment Survey](https://docs.google.com/forms/d/e/1FAIpQLSflQdN956q7Xh5caO8z8jIaF6uMLBkKrSxFvPi8OhNBWB247w/viewform). One can also view the project [here](https://www.cbioportal.org/installations) and [here](https://installationmap.netlify.app/).

### Features

- Search and filter map markers by institution, lab, or address
  ![search_and_filter](https://user-images.githubusercontent.com/33106214/103242175-52fe1b80-4923-11eb-91ae-4cde5b1b5bda.gif)
- Pan and zoom (buttons or scroll-wheel)
  ![pan_and_zoom](https://user-images.githubusercontent.com/33106214/103242026-e551ef80-4922-11eb-98cd-789a38b4d7da.gif)
- Sync map and table
  ![sync_map_and_table](https://user-images.githubusercontent.com/33106214/103242217-745f0780-4923-11eb-92d1-7dc0a9e04288.gif)
- Split or merge map markers based on zoom level
  ![split_or_merge_markers](https://user-images.githubusercontent.com/33106214/103242486-534ae680-4924-11eb-9e40-2167c0a48b98.gif)
- Render country borders with amount of detail based on zoom level
  ![country_borders](https://user-images.githubusercontent.com/33106214/103242453-34e4eb00-4924-11eb-9ed9-059bbf389e12.gif)
- Select map markers via clicking in table or on map
  ![select_markers](https://user-images.githubusercontent.com/33106214/103242556-986f1880-4924-11eb-8f95-f1c9ce018138.gif)
- Render in small or full mode; append `?small=1` at end of URL for the former

|                                                 small mode (sidebar)                                                 |                                                      full mode                                                      |
| :------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
| ![small_mode](https://user-images.githubusercontent.com/33106214/103241223-96a35600-4920-11eb-9193-871a00d6ab4f.png) | ![full_mode](https://user-images.githubusercontent.com/33106214/103241225-986d1980-4920-11eb-922f-510dcf9ece97.png) |

## Technologies

This project was created with:

- [Create React App](https://github.com/facebook/create-react-app)
  - Bootstraps the project
- [GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions)
  - For updating map marker data when users fill out the survey
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)
  - For translating location data from survey responses into longitude, latitude coordinates
- [Google Sheets API](https://developers.google.com/sheets/api/)
  - For fetching and storing survey response data into JSON format
- [Netlify](https://www.netlify.com/)
  - For hosting the React project
- [Python 3](https://www.python.org/)
  - For updating the map marker and geographical data
- [React 16.13.1](https://github.com/facebook/react)
- [React Simple Maps 2.1.2](https://github.com/zcreativelabs/react-simple-maps)
  - Convenient for rendering map marker data, countries
- [TypeScript 3.7.2](https://github.com/Microsoft/TypeScript)
  - For type checking and readable code

## Setup

This section features the steps to run this project locally.

- Clone the repository by doing `git clone https://github.com/jtquach1/installation-map.git`.
- Install the necessary dependencies by doing `yarn`.
- Make a development build by doing `yarn start`.
- View the project at [http://localhost:3006](http://localhost:3006).
