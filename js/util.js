let pages = [];
let pageNavigationElements = [];
const titles = ["Home", "Projects", "Blog", "Contact"];
const banners = ["banner-1.jpg", "banner-2.jpg", "banner-3.jpg", "banner-4.jpg", "banner-5.jpg", "banner-6.jpg", "banner-7.jpg"];
let scrolling = false;

function scrollTo(index) {
    if (scrolling) return;
    scrolling = true;
    setTimeout(() => {
        scrolling = false;
    }, config.scrollInterrupt);
    document.title = `${titles[index]} | Stijn van Schooten | svanschooten.nl`;
    app.page = titles[index];
    pages[index].scrollIntoView({
        behavior: "smooth",
        block: "end"
    });
    for (let pageNavigationElement of pageNavigationElements) {
        pageNavigationElement.classList.remove("active");
    }
    pageNavigationElements[index].classList.add("active");
    app.setModal(null);
    setWindowLocationHash();
}

async function setupNavigation() {
    pages = document.getElementsByClassName("page");
    pageNavigationElements = document.getElementsByClassName("page-navigation-element");

    for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        let pageNavigationElement = pageNavigationElements[i];
        if (config.useScrollNavigation) {
            page.addEventListener("wheel", (event) => {
                if (event.deltaY > 0 && i < (pages.length - 1)) {
                    scrollTo(i + 1);
                } else if (event.deltaY < 0 && i > 0) {
                    scrollTo(i - 1);
                }
            });
        }
        pageNavigationElement.addEventListener("click", () => {
            scrollTo(i);
        });
    }

    document.getElementById("container").style.width = `${pages.length * 100}%`;
}

async function setupBanner() {
    const banner = banners[getRandom(banners.length)];
    document.getElementById("header").style.backgroundImage = `url('images/banners/${banner}')`;
}

function getRandom(length) {
    return Math.floor(Math.random() * length);
}

function getFirestoreData(fs, collection, transform) {
    return new Promise((resolve, reject) => {
        fs.collection(collection).orderBy('created_at', 'desc').get().then((querySnapshot) => {
            const array = [];
            querySnapshot.forEach((snapshotData) => {
                let item = snapshotData.data();
                item.id = snapshotData.id;
                if (transform) {
                    item = transform(item);
                }
                array.push(item);
            });
            resolve(array);
        }).catch(reject);
    });
}

function setWindowLocationHash() {
    let hash = '#' + app.page;
    if (app.subpage) {
        hash = hash + '#' + app.subpage;
    }
    window.location.hash = hash;
}
