from locust import HttpUser, between, task



class WebsiteUser(HttpUser):
    wait_time = between(0.0033, 0.0034)
    
    def on_start(self):
        # self.client.post("/login", {"username":"admin@admin.ru", "password":"9AK-g9s-RnD-LYw"})
        pass
    
    # @task
    # def index(self):
    #     self.client.get("/")

    @task
    def s_profile(self):
        self.client.get("/user/profile")
    
    @task
    def s_events(self):
        # self.client.get("/events")
        pass
    
    @task
    def s_matches(self):
        self.client.get("/matches")
    
    @task
    def s_exercises(self):
        self.client.get("/exercises")
    
    @task
    def s_exs_folders(self):
        self.client.get("/exercises/folders")
    
    @task
    def s_players(self):
        self.client.get("/players")
    
    @task
    def s_analytics(self):
        self.client.get("/analytics")
    
    @task
    def s_video(self):
        # self.client.get("/video")
        pass
    
    @task
    def s_exercise_card(self):
        self.client.get("/exercises/exercise?id=26&nfb=1&type=nfb_folders")
    
    @task
    def s_match_card(self):
        self.client.get("/matches/match?id=102")
    
    @task
    def s_training_card(self):
        # self.client.get("/trainings/view/61")
        pass

    def on_stop(self):
        # self.client.post("/logout", {"username":"admin@admin.ru", "password":"9AK-g9s-RnD-LYw"})
        pass

