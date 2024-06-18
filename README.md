# Group Project Proposal 
By: Jackie Chen, Kayla Doan, Quang Nguyen, Kaiden Ong, Ryan Nguyen

# Project Description

## Who is our target audidence?
Oftentimes, figuring out a place to eat while considering everyone's preferences or needs can be difficult and lead to a lot of discussion and time wasted. Our target audience is precisely these individuals who want to socialize over food but cannot get an idea of their wants and are stuck by a sense of indecision. We envision college students bringing up this website before going out and making a choice quickly to limit the time planning and focus on the time together. We want to provide the chance for these college students who have difficulty in picking places that will appease a group of friends to be able to select their own needs and be given a fair and equal chance to have their opinion heard.

## Why does your audience want to use your application? Please provide some sort of reasoning. 
Our audience would want to use our application to save time by making simple and quick choices for them, leading to more time spent socializing rather than time spent planning. The application also provides a way for allowing people to have better communication between users and make everyone’s choices and opinions heard. Many people often dislike the hassle of taking time to discuss everyone's opinion when attempting to choose a restuarant, so our application is a perfect way to streamline this process making it much quicker and also allow people to potentially explore new restaurants that they would have ignored if everyone was not given a fair chance. Even if people have already tried most of the restaurants on the list/wheel, it provides a fun and entertaining way to pick restaurants when going out.

## Why do you as developers want to build this application?
As people who love eating and trying out new places, it can be incredibly difficult to all agree on a location. Thus we wish there was a web app that made it easy and enjoyable to find a spot that the whole group agrees on. So logically it made sense for us to create this web app. As developers this app drew us in because while not extremely difficult, it still provides great opportunities to apply everything we learned in this class to an app we will actually use.

# Technical Description

## Architectural Diagram
We will use rest API to take user input as well as mongodb as the database to store user and restaurant information.

![WhenToEat Architectural Diagram](https://github.com/info441-sp24/final-project-WhenToEat/blob/main/public/public/img/User%20Flow.jpg?raw=true)


## Data Flow
![WhenToEat Data Flow](https://github.com/info441-sp24/final-project-WhenToEat/blob/main/public/public/img/Data%20Flow.jpg?raw=true)

## User Stories
| Priority | User | Description | Implementation |
|----------|------|-------------|----------------|
| P0 | As an indecisive and hungry individual | I want to pick a restaurant while considering my friends' opinions and choices. | Allow users to search, pull, and input restaurant choices from a database into live sessions|
| P0 | As a user | I want to be able to join a wheel session with friends to pick a restaurant together. | Create live sessions (websockets) that allows each individual user to input a restaurant and the wheel will update dynamically. The chances are evenly split initially.|
| P0 | As a user | I want to vote on options that I would prefer | Create a point system where users get daily points and points for being a ‘winner’ and getting their choice selected. With these points, the user can add points to an option on the wheel to increase its chances of being picked. Create user profiles to keep track of points |
| P0 | As a user | I want to see the results of the wheel and see the restaurant choice as well as the person who put in that choice | After a wheel spinning animation, it lands on a choice and then displays a pop-up/modal that displays the winning choice and the person who chose it in the first place. Create a pop up for winners. |
| P1 | As a foodie | I want to see potential restaurant choices that I can input into the wheel | Pull restaurants from yelp/google API to keep the information up to date. Show these on an explore page as a list with the ability to add all of them to the aforementioned “wheel” |
| P1 | As a food explorer | I want to be able to access this application on the go | Have responsive design for our front end and handle any errors relating to wifi/internet to have a seamless mobile experience |
| P1 | As a foodie | I want to be able to filter through restaurant choices through food types and search for specific restaurants | Add search bar and sort/filter options to the explore restaurant list that will change the display depending on filter and search states |
| P2 | A social user | I want to find friends who share a love of eating food | Implement authentication and a friend system with a Mongodb to store user data such as friends. |

## API Endpoints:
* POST /user/register - Registers a new user.
* POST /user/login - Allows users to log into their account.
* GET /user/logout - Ends the user's session.
* GET /user/:id/profile - Retrieves the profile of a user based on their ID.
* GET /restaurants/explore - Retrieves a list of all restaurants in the specified area, potentially using third-party APIs like Yelp or Google.
* POST /restaurant/add - Allows a user to add a restaurant to the random selection wheel.
* GET /restaurant/random - Returns a randomly selected restaurant from the wheel, with weighted choices based on user preferences.
* POST /friends/add - Send a friend request to another user.
* GET /friends/list/:id - Lists all friends of a specific user.

## Database Schemas 
Users:
* Userid: string
* Username: string
* Friends: string
* History: Object
* Points: Int


Restaurants:
* Name: string
* Type: string
* Stars: int


History:
* Restaurants: Array of Strings (Restaurant Names)
* Userid: string
* Date: Date

Wheel Sessions:
* Restaurant Choices: Array of Strings (Restaurant Names)
* Users: Array of Strings (User IDs)
* Restaurant Weights: Array of Ints (Points voted on Restaurant)
