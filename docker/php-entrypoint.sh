#!/bin/sh

# Ensure log dir exists
mkdir -p /var/log/supervisor
touch /var/log/cron.log
chmod 644 /var/log/cron.log

touch /var/log/delivery_behavior.log
chmod 644 /var/log/delivery_behavior.log
touch /var/log/delivery_behavior_error.log
chmod 644 /var/log/delivery_behavior_error.log
touch /var/log/messenger_worker.log
chmod 644 /var/log/messenger_worker.log
touch /var/log/messenger_worker_error.log
chmod 644 /var/log/messenger_worker_error.log
# create table for transport for the workers
php bin/console messenger:setup-transports

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisor.conf