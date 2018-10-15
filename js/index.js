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

let posts = [];
let projects = [];
let statuses = [];
let subjects = [];
let types = [];
Vue.use(VueMarkdown);
const app = new Vue({
    el: '#app',
    data: {
        posts: posts,
        projects: projects,
        statuses: statuses,
        subjects: subjects,
        types: types
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
    await getFirestoreData(firestore, "statuses", statuses);
    await getFirestoreData(firestore, "subjects", subjects);
    await getFirestoreData(firestore, "types", types);
    await getFirestoreData(firestore, "projects", projects, (project) => {
        project.content = atob(project.content);
        return project;
    });
    await getFirestoreData(firestore, "blog", posts, (post) => {
        post.content = atob(post.content);
        return post;
    });
    await finishSetup();
})();
