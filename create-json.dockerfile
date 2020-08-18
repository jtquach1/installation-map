# Create waypoints.json.
FROM ubuntu:18.04
RUN apt-get --yes update
RUN apt-get --yes install python3-pip
RUN pip3 install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
RUN pip3 install -U googlemaps
RUN pip3 install apscheduler

WORKDIR /app
COPY quickstart.py ./
COPY credentials.json ./
COPY token.pickle ./
COPY src/waypoints.json ./build/static
ENTRYPOINT ["python3", "quickstart.py"]
