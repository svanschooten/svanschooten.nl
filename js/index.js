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
        statuses: [],
        subjects: [],
        types: [],
        modal: {},
        visibility: 'closed'
    },
    methods: {
        setModal: (content) => {
            app.visibility = (content ? 'open' : 'closed');
            app.modal = content;
        },
        getVisibility: (hover) => {
            if (app.visibility === 'open') return;
            app.visibility = (hover ? 'peek' : 'closed');
        }
    }
});

async function finishSetup() {
    if (window.location.hash && window.location.hash.length > 1) {
        const index = titles.indexOf(window.location.hash.replace("#", ""));
        if (index !== -1) {
            setTimeout(() => {
                scrollTo(index);
            }, 300);
        }
    }
}

(async () => {
    await setupNavigation();
    await setupBanner();
    await getFirestoreData(firestore, "statuses", app.statuses);
    await getFirestoreData(firestore, "subjects", app.subjects);
    await getFirestoreData(firestore, "types", app.types);
    await getFirestoreData(firestore, "projects", app.projects, (project) => {
        project.content = atob(project.content);
        return project;
    });
    await getFirestoreData(firestore, "blog", app.posts, (post) => {
        post.content = atob(post.content);
        post.created_at = new Date(post.created_at.seconds).toString();
        return post;
    });
    await finishSetup();
})();
