FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 sandbox \
    && useradd --uid 10001 --gid 10001 --no-create-home --home-dir /work \
       --shell /usr/sbin/nologin sandbox

COPY --chmod=0555 run.sh /usr/local/bin/leetkob-run

WORKDIR /work
USER 10001:10001
ENTRYPOINT ["/usr/bin/timeout", "--signal=KILL"]
