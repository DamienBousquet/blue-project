FROM postgres:18

COPY docker/db/db_commands.sql /docker-entrypoint-initdb.d/


COPY docker/db/db-entrypoint.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/db-entrypoint.sh
