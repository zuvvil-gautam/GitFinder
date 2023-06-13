/**
 * @license MIT
 * @author zuvvil-gautam <zuvvilgautamr123@gmail.com>
 * @copyright zuvvil-gautam 2023
 */


'use strict';

import { fetchData } from "./api.js";
import { numberToKilo } from "./module.js";

/**
 * Add eventlistener on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType String
 * @param {Function} callback Function
 */

const addEventOnElements = function($elements, eventType, callback){
    for(const $item of $elements){
        $item.addEventListener(eventType, callback);
    }
}

/**
 * Header scroll state
 */

const /**{NodeElement} */ $header = document.querySelector("[data-header]");

window.addEventListener("scroll", function(){
    $header.classList[this.window.scrollY > 50 ? "add":"remove"]("active");
});

const /**{NodeElement} */ $searchToggler = document.querySelector("[data-search-toggler]");

const /**{NodeElement} */ $searchField = document.querySelector("[data-search-field]");
let /**{Boolean} */ isExpanded = false;

$searchToggler.addEventListener("click", function(){ 
    $header.classList.toggle("search-active");
    isExpanded = isExpanded ? false : true;
    this.setAttribute("aria-expanded", isExpanded);
    $searchField.focus();
});

/**
 * Tab Navigation
 */

const /**{NodeList} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");

const /**{NodeList} */ $tabPanels = document.querySelectorAll("[data-tab-panel]");

let /** {NodeElement} */ [$lastActiveTabBtn] = $tabBtns;
let /** {NodeElement} */ [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function(){
    $lastActiveTabBtn.setAttribute("aria-selected","false");
    $lastActiveTabPanel.setAttribute("hidden", "");

    this.setAttribute("aria-selected", "true");
    const /** {NodeElement} */ $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
    $currentTabPanel.removeAttribute("hidden");

    $lastActiveTabBtn = this;
    $lastActiveTabPanel = $currentTabPanel; 
});

/**
 * Keyboard accessibility for tab buttons
 */

addEventOnElements($tabBtns, "keydown", function (e){
    const /** {NodeElement} */ $nextElement = this.nextElementSibling;
    const /** {NodeElement} */ $previousElement = this.previousElementSibling;
    
    if(e.key === "ArrowRight" && $nextElement){
        this.setAttribute("tabindex","-1");
        $nextElement.setAttribute("tabindex", "0");
        $nextElement.focus();
    } else if(e.key === "ArrowLeft" && $previousElement){
        this.setAttribute("tabindex","-1");
        $previousElement.setAttribute("tabindex", "0");
        $previousElement.focus();
    }
    
});

/**
 * Work with API
 */

/**
 * Search
 */

const /** {NodeElement} */ $searchSubmit = document.querySelector("[data-search-submit]");

let /** {String} */ apiUrl = "https://api.github.com/users/zuvvil-gautam";
let /** {String} */ repoUrl, followerUrl, followingUrl = "";

const searchUser = function () {
    if(!$searchField.value) return;

    apiUrl = `https://api.github.com/users/${$searchField.value}`;

    updateProfile(apiUrl);
}

$searchSubmit.addEventListener("click", searchUser);

// Search when press Enter key
$searchField.addEventListener("keydown", e => {
    if(e.key === "Enter") searchUser();
});


/**
 * Profile
 */

const /** {NodeElement} */ $profileCard = document.querySelector("[data-profile-card]");

const /** {NodeElement} */ $repoPanel = document.querySelector("[data-repo-panel]");

const /** {NodeElement} */ $error = document.querySelector("[data-error]");

window.updateProfile = function (profileUrl){

    $error.style.display = "none";
    document.body.style.overflowY = "visible";

    $profileCard.innerHTML = `
        <div class="profile-skeleton">
            <div class="skeleton avatar-skeleton"></div>
            <div class="skeleton title-skeleton"></div>
            <div class="skeleton text-skeleton text-1"></div>
            <div class="skeleton text-skeleton text-2"></div>
            <div class="skeleton text-skeleton text-3"></div>
        </div>
    `;
    
    $tabBtns[0].click();

    $repoPanel.innerHTML = `
        <div class="card repo-skeleton">

        <div class="card-body">
            <div class="skeleton title-skeleton"></div>

            <div class="skeleton text-skeleton text-1"></div>
            <div class="skeleton text-skeleton text-2"></div>
        </div>

        <div class="card-footer">
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
            <div class="skeleton text-skeleton"></div>
        </div>
    </div>
    `.repeat(6);

    fetchData(profileUrl, data => {

        const {
            type,
            avatar_url,
            name,
            login: username,
            html_url: githubPage,
            bio,
            location,
            company,
            blog: website,
            twitter_username,
            public_repos,
            followers,
            following,
            followers_url,
            following_url,
            repos_url

        } = data;

        repoUrl = repos_url;
        followerUrl = followers_url;
        followingUrl = following_url.replace("{/other_user}", "");

        $profileCard.innerHTML = `
            <figure class="${type === "User" ? "avatar-circle" : "avatar-rounded"}  img-holder" style="--width:280;  --height:280">
                <img src="${avatar_url}" width="280" height="280" alt="${username}" class="img-cover">
            </figure>

            ${name ? 
                `<h1 class="title-2">${name}</h1>` : ""
            }


            <p class="username text-primary">${username}</p>
            
            ${bio ? 
                `<p class="bio">${bio}</p>` : ""
            }

            <a href="${githubPage}" target="_blank" class="btn btn-secondary">
                <span class="material-symbols-rounded" aria-hidden="true">
                    open_in_new
                </span>

                <span class="span">See on Github</span>
            </a>

            <ul class="profile-meta">

                ${company ?
                
                `<li class="meta-item">
                    <span class="material-symbols-rounded" aria-hidden="true">apartment</span>

                    <span class="meta-text">${company}</span>
                </li>` : ""

                }

                ${location ?
                    `<li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">location_on</span>

                        <span class="meta-text">${location}</span>
                    </li>` : ""
                }

                ${website ?
                    `<li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">captive_portal</span>

                        <a href="${website}" target="_blank" class="meta-text">${website.replace("https://","")}</a>
                    </li>` : ""
                }



                   
            </ul>

            <ul class="profile-stats">
                
                <li class="stats-item">
                    <span class="body">${public_repos}</span>Repos
                </li>

                <li class="stats-item">
                    <span class="body">${numberToKilo(followers)}</span>Follower
                </li>

                <li class="stats-item">
                    <span class="body">${numberToKilo(following)}</span>Following
                </li>

            </ul>

            <div class="footer">
                <p class="copyright">&copy; 2023 zuvvil-gautam</p>
            </div>
        `;

        updateRepository();

    }, () =>{
        $error.style.display = "grid";
        document.body.style.overflowY = "hidden";

        $error.innerHTML = `
        
            <p class="title-1">Oops! :(</p>

            <p class="text">
                There is no account with this username yet.
            </p>
        `;
    });

}

updateProfile(apiUrl);

/**
 * Repository
 */

let /** {Array} */ forkedRepos = [];

const updateRepository = function () {

    fetchData(`${repoUrl}?sort=created&per_page=12`, function(data){

        $repoPanel.innerHTML = ` <h2 class="sr-only">Repositories</h2>`;
        forkedRepos = data.filter(item => /** {Boolean} */ item.fork);

        const /** {Array} */ repositories = data.filter(i => !i.fork);

        if (repositories.length) {
            for (const repo of repositories) {
                const {
                    name,
                    html_url,
                    description,
                    private: isPrivate,
                    language,
                    stargazers_count: stars_count,
                    forks_count

                } =repo;

                const /** {NodeElement} */ $repoCard = document.createElement("article");
                $repoCard.classList.add("card", "repo-card");

                $repoCard.innerHTML = `
                    <div class="card-body">
                        <a href="${html_url}" target="_blank" class="card-title">
                            <h3 class="title-3">${name}</h3>
                        </a>
                        ${description ? 
                            `<p class="card-text">${description}</p>` : ""
                        }

                        <span class="badge">${isPrivate ? "Private" : "Public"}</span>
                    </div>

                    <div class="card-footer">

                    ${language ? 
                    
                        `<div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">code_blocks</span>

                            <span class="span">${language}</span>
                        </div>` : ""

                    }   

                        <div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">star_rate</span>

                            <span class="span">${numberToKilo(stars_count)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">family_history</span>

                            <span class="span">${numberToKilo(forks_count)}</span>
                        </div>
                    </div>
                `;

                $repoPanel.appendChild($repoCard);
            }
        } else {
            $repoPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">
                        Doesn't have any public repositories yet.
                    </p>
                </div> 
            `;
        }
    });
}


/**
 * Forked repository
 */

const /**{NodeElement} */ $forkePanel = document.querySelector("[data-fork-panel]");
const /**{NodeElement} */ $forkTabBtn = document.querySelector("[data-forked-tab-btn]");

const updateForkRepo = function () {
    $forkePanel.innerHTML = ` <h2 class="sr-only">Forked repositories</h2>`;

    if (forkedRepos.length) {
        for (const repo of forkedRepos) {
            const {
                name,
                html_url,
                description,
                private: isPrivate,
                language,
                stargazers_count: stars_count,
                forks_count

            } = repo;

            const /** {NodeElement} */ $forkCard = document.createElement("article");
            $forkCard.classList.add("card", "repo-card");

            $forkCard.innerHTML = `
                    <div class="card-body">
                        <a href="${html_url}" target="_blank" class="card-title">
                            <h3 class="title-3">${name}</h3>
                        </a>
                        ${description ?
                    `<p class="card-text">${description}</p>` : ""
                }

                        <span class="badge">${isPrivate ? "Private" : "Public"}</span>
                    </div>

                    <div class="card-footer">

                    ${language ?

                    `<div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">code_blocks</span>

                            <span class="span">${language}</span>
                        </div>` : ""

                }   

                        <div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">star_rate</span>

                            <span class="span">${numberToKilo(stars_count)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="material-symbols-rounded"aria-hidden="true">family_history</span>

                            <span class="span">${numberToKilo(forks_count)}</span>
                        </div>
                    </div>
                `;

            $forkePanel.appendChild($forkCard);
        }
    } else {
        $forkePanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">
                        Doesn't have any forked repositories yet.
                    </p>
                </div> 
            `;
    }

}

$forkTabBtn.addEventListener("click", updateForkRepo);

/**
 * Follower
 */

const /** {NodeElement} */ $followerTabBtn = document.querySelector("[data-follower-tab-btn]");
const /** {NodeElement} */ $followerPanel = document.querySelector("[data-follower-panel]");

const updateFollower = function () {

    $followerPanel.innerHTML = `
    <div class="card follower-skeleton">
        <div class="skeleton avatar-skeleton"></div>

        <div class="skeleton title-skeleton"></div>
    </div>
    `.repeat(12);

    fetchData(followerUrl, function (data){

        $followerPanel.innerHTML  = `<h2 class="sr-only">Followers</h2>`;

        if(data.length) {
            for (const item of data) {

                const {
                    login: username,
                    avatar_url,
                    url
                } =item;

                const /** {NodeElement} */ $followerCard = document.createElement("article");
                $followerCard.classList.add("card", "follower-card");

                $followerCard.innerHTML = `
                    <figure class="avatar-circle img-holder">
                        <img src="${avatar_url}&s=64" width:"56" height="56" loading="lazy"  alt="${username}" class="img-cover">
                    </figure>

                    <h3 class="card-title">${username}</h3>

                    <button class="icon-btn" onClick="updateProfile(\'${url}\')" aria-label="Go to ${username} profile">
                        <span class="material-symbols-rounded" aria-hidden="true">link</span>
                    </button>
                `;

                $followerPanel.appendChild($followerCard);
            }
        } else {
            $followerPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">
                        Doesn't have any follower yet.
                    </p>
                </div>
            `;
        }
    })
}

$followerTabBtn.addEventListener("click", updateFollower);

/**
 * Following
 */

const /** {NodeElement} */ $followingTabBtn = document.querySelector("[data-following-tab-btn]");
const /** {NodeElement} */ $followingPanel = document.querySelector("[data-following-panel]");

const updateFollowing = function () {

    $followingPanel.innerHTML = `
        <div class="card follower-skeleton">
            <div class="skeleton avatar-skeleton"></div>

            <div class="skeleton title-skeleton"></div>
        </div>
    `.repeat(12);

    fetchData(followingUrl, function(data){

        $followingPanel.innerHTML=`<h2 class="sr-only">Followings</h2>
        `;

        if (data.length) {
            for (const item of data) {

                const {
                    login: username,
                    avatar_url,
                    url
                } = item;

                const /** {NodeElement} */ $followingCard = document.createElement("article");
                $followingCard.classList.add("card", "follower-card");

                $followingCard.innerHTML = `
                    <figure class="avatar-circle img-holder">
                        <img src="${avatar_url}&s=64" width:"56" height="56" loading="lazy"  alt="${username}" class="img-cover">
                    </figure>

                    <h3 class="card-title">${username}</h3>

                    <button class="icon-btn" onClick="updateProfile(\'${url}\')" aria-label="Go to ${username} profile">
                        <span class="material-symbols-rounded" aria-hidden="true">link</span>
                    </button>
                `;

                $followingPanel.appendChild($followingCard);
            }
        } else {
            $followingPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">
                        Doesn't have any following yet.
                    </p>
                </div>
            `;
        }


    });
}

$followingTabBtn.addEventListener("click",updateFollowing);

