// Do your work here...
// console.log('Hello, world!');

const bookshelf = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data != null) {
        for (const book of data) {
            bookshelf.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
    showToast('Data berhasil disimpan');
});

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerHTML = message + ' <span class="icon">✔✔</span>';
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompleteBOOKList = document.getElementById('incompleteBookList');
    const listComplete = document.getElementById('completeBookList');

    uncompleteBOOKList.innerHTML = '';
    listComplete.innerHTML = '';

    for (const bookItem of bookshelf) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            listComplete.append(bookElement);
        } else {
            uncompleteBOOKList.append(bookElement);
        }
    }
})

document.getElementById('bookFormIsComplete').addEventListener('change', function() {
    const submitButtonText = document.querySelector('#bookFormSubmit span');
    if (this.checked) {
        submitButtonText.innerText = "Selesai dibaca";
    } else {
        submitButtonText.innerText = "Belum selesai dibaca";
    }
});

function addBook() {
    const titleBook = document.getElementById('bookFormTitle').value;
    const authorBook = document.getElementById('bookFormAuthor').value;
    const yearBook = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    
    if (!titleBook || !authorBook || isNaN(yearBook)) {
        showToast('Mohon isi semua kolom dengan benar!');
        return;
    }

    if (bookshelf.some(book => book.title === titleBook && book.author === authorBook)) {
        showToast('Buku sudah ada di rak!');
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, isComplete);
    bookshelf.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    document.getElementById('bookForm').reset();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
}

function makeBook(bookObject) {
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-testid', 'bookItem');

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = `Penulis: ${bookObject.author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = `Tahun: ${bookObject.year}`;

    const actionContainer = document.createElement('div');

    const completeButton = document.createElement('button');
    completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    completeButton.innerText = bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    completeButton.addEventListener('click', function () {
        if (bookObject.isComplete) {
            removeBookFromCompleted(bookObject.id);
        } else {
            addBookToCompleted(bookObject.id);
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.innerText = 'Hapus Buku';
    deleteButton.addEventListener('click', function () {
        if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            deleteBook(bookObject.id);
        }
    });

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.innerText = 'Edit Buku';
    editButton.addEventListener('click', function () {
        editBook(bookObject.id);
    });

    actionContainer.append(completeButton, deleteButton, editButton);
    bookItem.append(bookTitle, bookAuthor, bookYear, actionContainer);
    return bookItem;
}

function findBookIndex(bookId) {
    return bookshelf.findIndex(book => book.id === bookId);
}

function findBook(bookId) {
    return bookshelf.find(book => book.id === bookId);
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    const book = bookshelf.find(book => book.id === bookId);
    if (!book) return;

    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;

    deleteBook(bookId);
}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex !== -1) {
        bookshelf.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        showToast('Buku berhasil dihapus');
    }
}