FROM postgres:18

COPY docker/db_commands.sql /docker-entrypoint-initdb.d/



