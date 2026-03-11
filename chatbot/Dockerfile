FROM rasa/rasa:3.6.2-full

WORKDIR /app

COPY . /app

# Switch to root to install python dependencies for custom actions
USER root

RUN pip install --no-cache-dir -r requirements.txt

# Switch back to non-root to run Rasa
USER 1001

CMD ["run", "-m", "models", "--enable-api", "--cors", "*", "--debug"]
