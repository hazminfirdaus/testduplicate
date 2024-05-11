function booksData() {
    return {
        books: [],
        searchTerm: '',
        searchedBooks: [],
        newBook: { title: '', author: '', genre: '', cover: null },
        showAddBookForm: false,
        showManageBooks: false,

        async toggleAddBookForm() {
            this.showAddBookForm = !this.showAddBookForm;
        },

        async toggleManageBooks() {
            this.showManageBooks = !this.showManageBooks;
        },

        handleFileChange(event) {
            this.newBook.cover = event.target.files[0]; // Update the cover image file
        },

        getCoverPath(path) {
            // Remove the 'public' prefix from the file path
            return path.replace('public', '');
        },

        async addBook() {
            const token = localStorage.getItem('token');
        
            if (!token) {
                console.error('JWT token not found in local storage');
                return;
            }
        
            // Create FormData object to send form data including files
            const formData = new FormData();
            formData.append('title', this.newBook.title);
            formData.append('author', this.newBook.author);
            formData.append('genre', this.newBook.genre);
            formData.append('cover', this.newBook.cover); // Add cover image file
        
            try {
                const response = await fetch('api/book/add', {
                    method: 'POST',
                    headers: {
                        'Application': 'application/json',
                        'Authorization': token,
                    },
                    body: formData // Use FormData object as body
                });
        
                if (!response.ok) {
                    throw new Error('Failed to add book');
                }
        
                // Clear the new book form fields and cover image
                this.newBook = { title: '', author: '', genre: '' };
                this.cover = null;
        
                // Fetch the updated list of books
                this.fetchBooks();
            } catch (error) {
                console.error('Error adding book:', error);
                alert('Failed to add book');
            }
        },

        async deleteBook(book) {
            // Prompt the user for confirmation
            const isConfirmed = window.confirm(`Are you sure you want to delete ${book.title}?`);
        
            // If the user confirms the deletion, proceed with the deletion process
            if (isConfirmed) {
                try {
                    const response = await fetch(`/api/book/delete/${book.uuid}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error('Failed to delete book');
                    }
                    // Filter out the deleted book from the list of books
                    this.books = this.books.filter(b => b.uuid !== book.uuid);
                    alert('Book deleted successfully!');
                } catch (error) {
                    console.error('Error deleting book:', error);
                    alert('Failed to delete book');
                }
            }
        },

        async updateBook(book) {
            try {
                const response = await fetch(`/api/book/update/${book.uuid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(book)
                });
                if (!response.ok) {
                    throw new Error('Failed to update book');
                }
                // Update the local books array with the updated book
                const updatedBook = await response.json();
                const index = this.books.findIndex(b => b.uuid === book.uuid);
                if (index !== -1) {
                    this.books[index] = updatedBook;
                }
                alert('Book updated successfully!');
                await this.fetchBooks();

                // Hide the edit form
                this.toggleEditForm(book);
            } catch (error) {
                console.error('Error updating book:', error);
                alert('Failed to update book');
            }
        },
        toggleEditForm(book) {
            book.isEditing = !book.isEditing;
        },
        cancelEdit(book) {
            // Reset the book properties to their original values
            const index = this.books.findIndex(b => b.id === book.id);
            if (index !== -1) {
                // Restore original book data from the books array
                const originalBook = this.books[index];
                Object.assign(book, originalBook);
            }
            // Hide the edit form
            this.toggleEditForm(book);
        },

        async searchBooks() {
            if (!this.searchTerm.trim()) {
                this.searchedBooks = []; // Clear the books array if search term is empty
                return;
            }
        
            try {
                const response = await fetch(`/api/books/search?term=${encodeURIComponent(this.searchTerm)}`);
                if (response.ok) {
                    this.searchedBooks = await response.json(); // Update books with fetched data
                } else {
                    throw new Error('Failed to fetch books');
                }
            } catch (error) {
                console.error('Error searching books:', error);
                alert('Failed to search for books');
            }
        },

        async clearSearch() {
            this.searchTerm = ''
        },
       
        async displayBooksByGenre(genre) {
            try {
                const response = await fetch(`/api/books/genre?genre=${genre}`);
                if (response.ok) {
                    const books = await response.json();
                    this.books = books;
                } else {
                    throw new Error('Failed to fetch books by genre');
                }
            } catch (error) {
                console.error('Error fetching books by genre:', error);
                alert('Failed to fetch books by genre');
            }
        },

        async fetchBooks() {
            try {
                const response = await fetch('/api/books');
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const books = await response.json();
                // Initialize the isEditing property for each book
                this.books = books.map(book => ({ ...book, isEditing: false }));
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        },
    };
}