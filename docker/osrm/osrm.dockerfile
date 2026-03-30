FROM osrm/osrm-backend

COPY docker/osrm/osrm_commands.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/osrm_commands.sh

ENTRYPOINT ["/usr/local/bin/osrm_commands.sh"]
