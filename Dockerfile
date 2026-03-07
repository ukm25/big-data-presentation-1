# Dockerfile for Apache Pig + Hadoop environment
FROM eclipse-temurin:8-jdk

# Install dependencies
RUN apt-get update && apt-get install -y wget tar bash python3 python3-pip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Hadoop
ENV HADOOP_VERSION 2.7.7
RUN wget -q https://archive.apache.org/dist/hadoop/common/hadoop-$HADOOP_VERSION/hadoop-$HADOOP_VERSION.tar.gz && \
    tar -xzf hadoop-$HADOOP_VERSION.tar.gz && \
    mv hadoop-$HADOOP_VERSION /usr/local/hadoop && \
    rm hadoop-$HADOOP_VERSION.tar.gz

# Install Pig
ENV PIG_VERSION 0.17.0
RUN wget -q https://archive.apache.org/dist/pig/pig-$PIG_VERSION/pig-$PIG_VERSION.tar.gz && \
    tar -xzf pig-$PIG_VERSION.tar.gz && \
    mv pig-$PIG_VERSION /usr/local/pig && \
    rm pig-$PIG_VERSION.tar.gz

# Set Environment Variables
ENV HADOOP_HOME /usr/local/hadoop
ENV PIG_HOME /usr/local/pig
ENV PATH $PATH:$HADOOP_HOME/bin:$PIG_HOME/bin
ENV PIG_CLASSPATH $HADOOP_HOME/etc/hadoop

# Setup working directory and scripts
WORKDIR /scripts

# Maintain terminal open
CMD ["/bin/bash"]
