const firebaseConfig = {
    apiKey: "AIzaSyBa78Det6d2GObTrsBU1roZ0P3P0SKHONQ",
    authDomain: "svanschooten-c01f7.firebaseapp.com",
    databaseURL: "https://svanschooten-c01f7.firebaseio.com",
    projectId: "svanschooten-c01f7",
    storageBucket: "svanschooten-c01f7.appspot.com",
    messagingSenderId: "211466426536"
};

const config = {
    scrollInterrupt: 300,
    bannerFade: 5 * 1000,
    useScrollNavigation: false,
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
firestore.settings({
    timestampsInSnapshots: true
});

Vue.use(VueMarkdown);
const app = new Vue({
    el: '#app',
    data: {
        posts: [],
        projects: [],
        modal: {},
        visibility: 'closed',
        page: 'Home',
        subpage: null
    },
    methods: {
        setModal: (content) => {
            if (content) {
                app.visibility = 'open';
            } else {
                app.visibility = 'closing';
                setTimeout(() => {
                    app.visibility = 'closed';
                }, 300);
            }
            app.modal = content;
            app.subpage = (content ? content.id : null);
            setWindowLocationHash();
        },
        getVisibility: (hover) => {
            if (app.visibility === 'open' || app.visibility === 'closing') return;
            app.visibility = (hover ? 'peek' : 'closed');
        }
    }
});

async function finishSetup() {
    if (window.location.hash && window.location.hash.length > 1) {
        let hashes = window.location.hash.split("#");
        if (hashes.length > 1) {
            const index = titles.indexOf(hashes[1]);
            if (index !== -1) {
                setTimeout(() => {
                    scrollTo(index);
                }, 500);
            }
        }
        if (hashes.length > 2) {
            const data = app.projects.concat(app.posts);
            console.log(data);
            for (let entry of data) {
                if (entry.id === hashes[2]) {
                    console.log("Haa");
                    setTimeout(() => {
                        app.setModal(entry);
                    }, 1000);
                    break;
                }
            }
        }
    }
}

(async () => {
    await setupBanner();
    await setupNavigation();
    // app.projects = await getFirestoreData(firestore, "projects", (project) => {
    //     project.content = atob(project.content);
    //     project.created_at = new Date(project.created_at.seconds * 1000).toLocaleDateString();
    //     project.data = project.type;
    //     return project;
    // });
    app.posts = await getFirestoreData(firestore, "blog", (post) => {
        post.content = atob(post.content);
        post.data = new Date(post.created_at.seconds * 1000).toLocaleDateString();
        return post;
    });
    await finishSetup();
    document.getElementById("loader").classList.add("done");
    setTimeout(() => {
        const elem = document.getElementById("loader");
        elem.parentNode.removeChild(elem);
    }, 1000);
})();
