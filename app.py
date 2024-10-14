from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('punkt')
nltk.download('wordnet')
nltk.download('stopwords')

app = Flask(__name__)


# TODO: Fetch dataset, initialize vectorizer and LSA here
newsgroups = fetch_20newsgroups(subset='all')

stop_words = stopwords.words('english')
vectorizer = TfidfVectorizer(stop_words=stop_words)
term_doc_matrix = vectorizer.fit_transform(newsgroups.data)

num_components = 105
svd_model = TruncatedSVD(n_components=num_components)
svd_matrix = svd_model.fit_transform(term_doc_matrix)



def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    # Transform query into the same space as documents
    query_vec = vectorizer.transform([query])
    query_svd = svd_model.transform(query_vec)
    
    # Compute cosine similarity between the query and all documents
    similarities = cosine_similarity(query_svd, svd_matrix)[0]
    
    # Get the top 5 most similar documents
    top_5_indices = similarities.argsort()[-5:][::-1]  # Get indices of top 5 similar documents
    top_5_documents = [newsgroups.data[i] for i in top_5_indices]
    top_5_similarities = similarities[top_5_indices]
    
    return top_5_documents, top_5_similarities.tolist(), top_5_indices.tolist() 


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True)
