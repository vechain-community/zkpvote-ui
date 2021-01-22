.PHONY: image/build, image/push


image/build:
	docker build -t registry.gitlab.com/oceanex/registry/zkp-vote:latest .

image/push:
	docker push registry.gitlab.com/oceanex/registry/zkp-vote:latest
